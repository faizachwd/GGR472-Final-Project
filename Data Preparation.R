library(tidyverse)
library(readr)
library(sf)
library(classInt) 

can_fed <- read_csv("GUF_3000m.csv")

can_fed_on <- can_fed %>% filter(province == "ON" & cmauid == 535) %>%
  select_if(~ ! any(is.na(.))) %>% filter(csdname == "Mississauga") %>%
  select(c("v1", "dauid", "province", "pruid", "prname", "csduid", "csdname", "cmauid", 
  "cmaname", "popctrraclass", "mRFEI_cat_ON", "rmix_cat_ON", "_denfastfood_cat_ON", 
  "_denallconvenience_cat_ON", "_denchaingrocerystores_cat_ON", 
  "_dengrocerystores_cat_ON", "_denfruitandvegetable_cat_ON", "_denrestaurants_cat_ON"))


#cartographic boundaries
DA_shp <- st_read("lda_000b16a_e")

DA_shp$DAUID <- as.numeric(DA_shp$DAUID)

DA_shp_geo <- DA_shp %>% select(DAUID, geometry)

combined_data <- left_join(can_fed_on, DA_shp_geo, by = join_by(x$dauid == y$DAUID))

age_data <- read_csv("98-400-X2016003_ENG_CSV (1)/98-400-X2016003_English_CSV_data.csv")

#filtering for mississauga 
age_data <- age_data %>% filter(GEO_NAME %in% combined_data$dauid)
#DA 35211561 is missing from age data

#filtering for stats on total population, population >= 65, and avg age
age_data <- age_data %>% filter(`Member ID: Age (in single years) and average age (127)` %in% c(1, 82, 127))

#selecting necessary columns, not looking at sex breakdown
age_data <- age_data %>% select(
  !c(CENSUS_YEAR, `GEO_CODE (POR)`, GEO_LEVEL, GNR, DATA_QUALITY_FLAG, CSD_TYPE_NAME, ALT_GEO_CODE,
     `Member ID: Age (in single years) and average age (127)`, `Notes: Age (in single years) and average age (127)`,
     `Dim: Sex (3): Member ID: [2]: Male`, `Dim: Sex (3): Member ID: [3]: Female`))

#widening data
age_data <- age_data %>% pivot_wider(names_from = `DIM: Age (in single years) and average age (127)`, values_from = `Dim: Sex (3): Member ID: [1]: Total - Sex`)

mother_tongue_data <- read_csv("98-400-X2016055_ENG_CSV/98-400-X2016055_English_CSV_data.csv")

#filtering for mississauga 
mother_tongue_data <- mother_tongue_data %>% filter(GEO_NAME %in% combined_data$dauid)
#DA 35211561 is missing from mother_tongue data

#filtering for stats on total population, not looking at sex breakdown
mother_tongue_data <- mother_tongue_data %>% filter(`Member ID: Sex (3)` == 1)

#selecting necessary columns
mother_tongue_data <- mother_tongue_data %>% select(
  !c(CENSUS_YEAR, `GEO_CODE (POR)`, GEO_LEVEL, GNR, DATA_QUALITY_FLAG, 
     CSD_TYPE_NAME, ALT_GEO_CODE, `DIM: Sex (3)`, `Member ID: Sex (3)`, `Notes: Sex (3)`,`Notes: Mother tongue (269)`, 
     `Member ID: Mother tongue (269)`, 
     `Dim: Knowledge of official languages (5): Member ID: [2]: English only`, 
     `Dim: Knowledge of official languages (5): Member ID: [3]: French only`, 
     `Dim: Knowledge of official languages (5): Member ID: [4]: English and French`, 
     `Dim: Knowledge of official languages (5): Member ID: [5]: Neither English nor French`))

#calculating percentage of speakers that speak a non official language as a first language to highlight diversity of DA
#unsure if they also speak an official language as one of their first languages
mother_tongue_data <- mother_tongue_data %>% filter((`DIM: Mother tongue (269)`) %in% c("Total - Mother tongue", "Non-official languages"))
mother_tongue_data <- mother_tongue_data %>% pivot_wider(names_from = `DIM: Mother tongue (269)`, values_from = `Dim: Knowledge of official languages (5): Member ID: [1]: Total - Knowledge of official languages`) 
mother_tongue_data <- mother_tongue_data %>%  mutate("Residents that who speak a non official language as a first language (%):" = `Non-official languages`/`Total - Mother tongue`*100) 

#miway bus stops
bus_stops <- st_read("MiWay_Bus_Stops_-6419361053968596395")

#transforming to NAD83, EPSG:3978 to match dissemination area file geometry
target_wkt <- 'PROJCRS["PCS_Lambert_Conformal_Conic",
                      BASEGEOGCRS["NAD83",
                                  DATUM["North American Datum 1983",
                                        ELLIPSOID["GRS 1980",6378137,298.257222101,
                                                  LENGTHUNIT["metre",1]],
                                        ID["EPSG",6269]],
                                  PRIMEM["Greenwich",0,
                                         ANGLEUNIT["Degree",0.0174532925199433]]],
                      CONVERSION["unnamed",
                                 METHOD["Lambert Conic Conformal (2SP)",
                                        ID["EPSG",9802]],
                                 PARAMETER["Latitude of false origin",63.390675,
                                           ANGLEUNIT["Degree",0.0174532925199433],
                                           ID["EPSG",8821]],
                                 PARAMETER["Longitude of false origin",-91.8666666666667,
                                           ANGLEUNIT["Degree",0.0174532925199433],
                                           ID["EPSG",8822]],
                                 PARAMETER["Latitude of 1st standard parallel",49,
                                           ANGLEUNIT["Degree",0.0174532925199433],
                                           ID["EPSG",8823]],
                                 PARAMETER["Latitude of 2nd standard parallel",77,
                                           ANGLEUNIT["Degree",0.0174532925199433],
                                           ID["EPSG",8824]],
                                 PARAMETER["Easting at false origin",6200000,
                                           LENGTHUNIT["metre",1],
                                           ID["EPSG",8826]],
                                 PARAMETER["Northing at false origin",3000000,
                                           LENGTHUNIT["metre",1],
                                           ID["EPSG",8827]]],
                      CS[Cartesian,2],
                      AXIS["(E)",east,
                           ORDER[1],
                           LENGTHUNIT["metre",1,
                                      ID["EPSG",9001]]],
                      AXIS["(N)",north,
                           ORDER[2],
                           LENGTHUNIT["metre",1,
                                      ID["EPSG",9001]]]]'
bus_stops <- st_transform(bus_stops, target_wkt)

#selecting variables relevant to buffer analysis
bus_stops <- bus_stops %>% select(Stop_Numbe, geometry)

#map layers
mother_tongue_data$GEO_NAME <- as.numeric(mother_tongue_data$GEO_NAME)
layer_mother_tongue <- left_join(mother_tongue_data, DA_shp_geo, by = join_by(x$GEO_NAME == y$DAUID)) %>% st_as_sf()

age_data$GEO_NAME <- as.numeric(age_data$GEO_NAME)
age_data$`Population above 65 (%)` = (age_data$`65 years and over`/age_data$`Total - Age`)*100

layer_age_data <- left_join(age_data, DA_shp_geo, by = join_by(x$GEO_NAME == y$DAUID)) %>% st_as_sf()

layer_can_fed <- combined_data %>% select(mRFEI_cat_ON, dauid, geometry) %>% st_as_sf()

DA_boundaries <- combined_data %>% select(dauid, geometry) %>% st_sf()

#writing all layers to geojson
layer_can_fed <- st_transform(layer_can_fed, crs = 4326)
layer_age_data <- st_transform(layer_age_data, crs = 4326)
layer_mother_tongue <- st_transform(layer_mother_tongue, crs = 4326)
bus_stops <- st_transform(bus_stops, crs = 4326)
DA_boundaries <- st_transform(DA_boundaries, crs = 4326)



st_write(layer_can_fed, "can_fed.geojson")
st_write(layer_age_data, "age.geojson")
st_write(layer_mother_tongue, "mother_tongue.geojson")
st_write(bus_stops, "bus_stops.geojson")
st_write(DA_boundaries, "da_boundaries.geojson" )


