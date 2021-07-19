"""  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
process_publicTransport.py
--------------
Loads the public transport data from the csv files and processes it by averageing and grouping the data to a more readable form

"""

# Note: This code is written in Python version 2!

import pandas as pd
from pandas.compat import OrderedDict

# Read the data
data = pd.read_csv("../../data/public_transport/Fahrgastzahlen_2019/REISENDE.csv", sep=";")
stops = pd.read_csv("../../data/public_transport/Fahrgastzahlen_2019/HALTESTELLEN.csv", sep=";")
stops_small = pd.read_csv("../../data/public_transport/PublicTransportStops.csv", sep=",")

# Some pre processing/cleaning
data = data.dropna()
data.Nach_Hst_Id = data.Nach_Hst_Id.astype(int)
print len(data)

# Join the data with the stops
stops_joined = stops_small.set_index('DIVA_NR').join(stops.set_index('Haltestellennummer'))
stopIDs = list(stops_joined.Haltestellen_Id.dropna().astype(int))
filtered_data = data[data.Haltestellen_Id.isin(stopIDs)]
print len(filtered_data)
df = filtered_data[filtered_data.Nach_Hst_Id.isin(stopIDs)]
print len(df)

# Group by the hours, so we have one average value for each hour of the day
df['hour'] = df['FZ_AB'].str[0:2].astype(int)
df_grouped = df.groupby(['ID_Abschnitt', 'hour']).mean()

# Loop over the data and create a entry with the necessary info for each section
data_json = OrderedDict()
for row in df_grouped.itertuples():

    From = stops_joined.loc[stops_joined.Haltestellen_Id == row.Haltestellen_Id].index[0]
    To = stops_joined.loc[stops_joined.Haltestellen_Id == row.Nach_Hst_Id].index[0]
    id_fromTo = str(min(From,To)) + '_' + str(max(From,To))

    # If it does not exist yet (first time this section comes up), create a new entry
    if (id_fromTo not in data_json.keys()):
        data_json[id_fromTo] = OrderedDict()
        data_json[id_fromTo]['Fr'] = From
        data_json[id_fromTo]['To'] = To
        data_json[id_fromTo]['x_from'] = stops_joined.loc[stops_joined.Haltestellen_Id == row.Haltestellen_Id].x.iloc[0]
        data_json[id_fromTo]['y_from'] = stops_joined.loc[stops_joined.Haltestellen_Id == row.Haltestellen_Id].y.iloc[0]
        data_json[id_fromTo]['x_to'] = stops_joined.loc[stops_joined.Haltestellen_Id == row.Nach_Hst_Id].x.iloc[0]
        data_json[id_fromTo]['y_to'] = stops_joined.loc[stops_joined.Haltestellen_Id == row.Nach_Hst_Id].y.iloc[0]

    # Else just update the values
    if ('h_' + str(row.Index[1]) not in data_json[id_fromTo].keys()):
        data_json[id_fromTo]['h_' + str(row.Index[1])] = row.Besetzung
    else:
        data_json[id_fromTo]['h_' + str(row.Index[1])] =  (data_json[id_fromTo]['h_' + str(row.Index[1])] + row.Besetzung) / 2
    
final = pd.DataFrame.from_dict(data_json, orient='index')

# Print to csv
final['all'] = final[["h_" + str(i) for i in range(4,29)]].mean(axis=1)
final.to_csv('../../data/public_transport/PT_Occupancy.csv', sep=',')