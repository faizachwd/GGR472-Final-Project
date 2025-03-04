library(tidyverse)
library(readr)
library(sf)

can_fed <- read_csv("Documents/GitHub/GGR472-Final-Project/GUF_3000m.csv")

can_fed_on <- can_fed %>% filter(province == "ON" & cmauid == 535) %>%
  select_if(~ ! any(is.na(.))) %>% filter(csdname == "Mississauga") %>%
  select(c("v1", "dauid", "province", "pruid", "prname", "csduid", "csdname", "cmauid", 
  "cmaname", "popctrraclass", "mRFEI_cat_ON", "rmix_cat_ON", "_denfastfood_cat_ON", 
  "_denallconvenience_cat_ON", "_denchaingrocerystores_cat_ON", 
  "_dengrocerystores_cat_ON", "_denfruitandvegetable_cat_ON", "_denrestaurants_cat_ON"))


#cartographic boundaries
DA_shp <- st_read("/Users/faiza/Documents/GitHub/GGR472-Final-Project/lda_000b16a_e")

DA_shp$DAUID <- as.numeric(DA_shp$DAUID)

DA_shp_sauga <- DA_shp %>% select(DAUID, geometry)

combined_data <- left_join(can_fed_on, DA_shp_sauga, by = join_by(x$dauid == y$DAUID))

plot(combined_data$geometry)



