"""  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
synthetize_traffic.py
--------------
Reads the result from the processing of the traffic data and adds synthetic data for the future scenarios (no project/project)

"""
# Note: This code is written in Python version 2!

import pandas as pd
from datetime import datetime
import random
import math

ratio_pro = 0.3 # Ratio of how much more occupancy should be in the future with the project (maximum)
ratio_no = 0.2 # Ratio of how much more occupancy should be in the future without the project (maximum)

# Read the data from the processing step
data = pd.read_csv("../../data/traffic/traffic_direction.csv", sep=",")

# Do some cleaning, remove wrong data
data["ZSID"] = data["Unnamed: 0"].str[:4]
data = data[data.ZSID != "Z039"]
data = data[data.ZSID != "Z027"]

# Copy the data twice
data1 = data[~data.duplicated(subset="ZSID")]
data2 = data[data.duplicated(subset="ZSID")]

# Put the two datasets next to each other, so that we can make the from-to data set, so that we have geometry twice
data = pd.merge(data1, data2, left_on="ZSID", right_on="ZSID", how="left")

# Remove unwanted columns
data = data.drop(["Unnamed: 0_x", "Unnamed: 0_y", "Direction_x", "Direction_y"], axis=1)

# Define from where to where the different measurement points stretch
fromToData = {
        "Z026": {
            "Fr_name": "Escher-Wyss-Platz",
            "To_name": "Rosengartenstrasse"
            },
         "Z038": {
            "Fr_name": "Rosengartenstrasse",
            "To_name": "Bucheggplatz"
            },
         "Z052": {
            "Fr_name": "Milchbuch",
            "To_name": "Bucheggplatz",
            },
         "Z065": {
            "Fr_name": "Escher-Wyss-Platz",
            "To_name": "Förrlibuchstrasse"
            },
         "Z071": {
            "Fr_name": "Wiedikon",
            "To_name": "Albisriederplatz"
            },
         "Z081": {
            "Fr_name": "Technopark",
            "To_name": "Hardbrücke"
            },
         "Z082": {
            "Fr_name": "Hardbrücke",
            "To_name": "Albisriederplatz"
            },
         "Z083": {
            "Fr_name": "Hardbrücke",
            "To_name": "Escher-Wyss-Platz"
            },
         "Z097": {
            "Fr_name":  "Radiostudio",
            "To_name": "Bucheggplatz"
            },
            
        }
frToData = pd.DataFrame.from_dict(fromToData, orient = 'index')

# Add this information to the other dataset
data = pd.merge(data, frToData, left_on="ZSID", right_index = True, how="left")

# Prepare empty data positions to fill later
data["project"] = 0;

data["pro_all_x"] = None;
data["pro_all_y"] = None;

data["no_all_x"] = None;
data["no_all_y"] = None;

data["all"] = None;
data["no_all"] = None;
data["pro_all"] = None;

for i in range(0,24):
    data["pro_h_" + str(i) + "_x"] = None
    data["pro_h_" + str(i) + "_y"] = None
    data["no_h_" + str(i) + "_x"] = None
    data["no_h_" + str(i) + "_y"] = None

# Add one row for the tunnel
new_row = {'ZSID':'Z999', "Fr_name": "Rosengarten (Tunnel)", "To_name": "Bucheggplatz (Tunnel)", "project": 1}
data = data.append(new_row, ignore_index=True)

index38 = 0
# Loop over all data and add a random number of percentage (inside of the ratio of the existing data, defined in the beginning)
# But also do it in both directions!!
for j, row  in data.iterrows():


    data.at[j,"pro_all_x"] =  0
    data.at[j,"pro_all_y"] = 0

    data.at[j,"no_all_x"] = 0
    data.at[j,"no_all_y"] = 0

    for i in range(0,24):
        if (row["ZSID"] == "Z038"):
            data.at[j,"pro_h_" + str(i)+ "_x"] =  row["h_" + str(i)+ "_x"] * (0.05  + 0.1 * random.random())
            data.at[j,"pro_h_" + str(i)+ "_y"] =  row["h_" + str(i)+ "_y"] * (0.05  + 0.1 * random.random())
            data.at[j,"no_h_" + str(i)+ "_x"] = row["h_" + str(i)+ "_x"] + row["h_" + str(i)+ "_x"] * 0.1 * random.random()
            data.at[j,"no_h_" + str(i)+ "_y"] = row["h_" + str(i)+ "_y"] + row["h_" + str(i)+ "_y"] * 0.1 * random.random()

            index38 = j
        elif (row["ZSID"] == "Z026"):
            data.at[j,"pro_h_" + str(i)+ "_x"] = row["h_" + str(i)+ "_x"] + row["h_" + str(i)+ "_x"] * 0.1 * random.random()
            data.at[j,"pro_h_" + str(i)+ "_y"] = row["h_" + str(i)+ "_y"] + row["h_" + str(i)+ "_y"] * 0.1 * random.random()
            data.at[j,"no_h_" + str(i)+ "_x"] = row["h_" + str(i)+ "_x"] + row["h_" + str(i)+ "_x"] * 0.1 * random.random()
            data.at[j,"no_h_" + str(i)+ "_y"] = row["h_" + str(i)+ "_y"] + row["h_" + str(i)+ "_y"] * 0.1 * random.random()
           
        
        elif (row["ZSID"] == "Z999"):
            data.at[j,"pro_h_" + str(i)+ "_x"] =  data.at[index38, "h_" + str(i)+ "_x"] * (0.94  + 0.1 * random.random())
            data.at[j,"pro_h_" + str(i)+ "_y"] =  data.at[index38, "h_" + str(i)+ "_y"] * (0.94  + 0.1 * random.random())
            data.at[j,"pro_all_x"] +=  data.at[j,"pro_h_" + str(i)+ "_x"]
            data.at[j,"pro_all_y"] +=  data.at[j,"pro_h_" + str(i)+ "_y"]
            continue
        else:
            data.at[j,"pro_h_" + str(i)+ "_x"] = row["h_" + str(i)+ "_x"] + row["h_" + str(i)+ "_x"] * ratio_pro * random.random()
            data.at[j,"pro_h_" + str(i)+ "_y"] = row["h_" + str(i)+ "_y"] + row["h_" + str(i)+ "_y"] * ratio_pro * random.random()
            data.at[j,"no_h_" + str(i)+ "_x"] = row["h_" + str(i)+ "_x"] + row["h_" + str(i)+ "_x"] * ratio_no * random.random()
            data.at[j,"no_h_" + str(i)+ "_y"] = row["h_" + str(i)+ "_y"] + row["h_" + str(i)+ "_y"] * ratio_no * random.random()
        
        data.at[j,"pro_all_x"] +=  data.at[j,"pro_h_" + str(i)+ "_x"]
        data.at[j,"pro_all_y"] +=  data.at[j,"pro_h_" + str(i)+ "_y"]
        data.at[j,"no_all_x"] += data.at[j,"no_h_" + str(i)+ "_x"] 
        data.at[j,"no_all_y"] += data.at[j,"no_h_" + str(i)+ "_y"]

    data.at[j,"all"] = ((row["all_x"] + row["all_y"]) / 2)/10;
    data.at[j,"no_all"] = ((data.at[j,"no_all_x"] + data.at[j,"no_all_y"]) / 2)/10;
    data.at[j,"pro_all"] = ((data.at[j,"pro_all_x"] + data.at[j,"pro_all_y"]) / 2)/10;
    
# Save to csv
data.to_csv('../../data/traffic/traffic_faked.csv', sep=',', index=False)
