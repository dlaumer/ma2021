"""  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
synthetize_publicTransport.py
--------------
Reads the result from the processing of the public transport data and adds synthetic data for the future scenarios (no project/project)

"""
# Note: This code is written in Python version 2!

import pandas as pd
from datetime import datetime
import random

ratio_pro = 0.4 # Ratio of how much more occupancy should be in the future with the project (maximum)
ratio_no = 0.3 # Ratio of how much more occupancy should be in the future without the project (maximum)

# Read the data from the processing step
data = pd.read_csv("../../data/public_transport/PT_Occupancy.csv", sep=",")
stops = pd.read_csv("../../data/public_transport/Fahrgastzahlen_2019/HALTESTELLEN.csv", sep=";")

# Make dict of stops names
# merge again with the haltestellen (maybe not necessary anymore)
data = pd.merge(data, stops[["Haltestellennummer","Haltestellenlangname"]], left_on="Fr", right_on="Haltestellennummer", how="left")
data = data.rename(columns={"Haltestellenlangname": "Fr_name"})
data = pd.merge(data, stops[["Haltestellennummer","Haltestellenlangname"]], left_on="To", right_on="Haltestellennummer", how="left")
data = data.rename(columns={"Haltestellenlangname": "To_name"})
data = data.drop(["Haltestellennummer_x"], axis=1)
data = data.drop(["Haltestellennummer_y"], axis=1)

data = data[data.ID != "48_468"] # An outlier 

# Remove the number in the front
data['Fr_name'] = data['Fr_name'].str[8:]
data['To_name'] = data['To_name'].str[8:]

data["project"] = 0;    # boolean to tell that those are not just for the project version of the data, but already existing

data["pro_all"] = None;
data["no_all"] = None;
for i in range(4,29):
    data["pro_h_" + str(i)] = None
    data["no_h_" + str(i)] = None

# Loop over all data and add a random number of percentage (inside of the ratio of the existing data, defined in the beginning)
for j, row  in data.iterrows():
    data.at[j,"pro_all"] = row["all"] + row["all"] * ratio_pro * random.random()
    data.at[j,"no_all"] = row["all"] + row["all"] * ratio_no * random.random()
    for i in range(4,29):
        data.at[j,"pro_h_" + str(i)] = row["h_" + str(i)] + row["h_" + str(i)] * ratio_pro * random.random()
        data.at[j,"no_h_" + str(i)] = row["h_" + str(i)] + row["h_" + str(i)] * ratio_no * random.random()

# Save to csv
data.to_csv('../../data/public_transport/PT_Occupancy_Faked.csv', sep=',', index=False)
