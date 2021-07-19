"""  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
process_traffic.py
--------------
Loads the traffic data from the csv files and processes it by averageing and grouping the data to a more readable form


"""
# Note: This code is written in Python version 2!

import pandas as pd
from datetime import datetime
from pandas.compat import OrderedDict

dateparse = lambda x: datetime.strptime(x, '%Y-%m-%dT%H:%M:%S')
'''
data = pd.read_csv("../../data/sid_dav_verkehrszaehlung_miv_OD2031_2020.csv", sep=",")
print data.head()

ids = [97, 52, 38, 26, 27, 65, 81, 39, 82, 83, 71]
ids = ["Z0" + str(i) for i in ids]

data_filtered = data[data.ZSID.isin(ids)]
data_filtered.to_csv("../../data/verkehr_filtered_2.csv")

'''
data = pd.read_csv("../../data/traffic/verkehr_filtered.csv", sep=",",  parse_dates=['MessungDatZeit'], date_parser=dateparse)

data['hour'] = data['MessungDatZeit'].dt.hour
#data['day'] = data['MessungDatZeit'].day

df_grouped = data.groupby(['ZSID','hour', 'Richtung']).mean()
print df_grouped.head(30)

df_grouped_all = df_grouped.groupby(['ZSID', 'Richtung']).sum()
print df_grouped_all.head(30)

data_json = OrderedDict()
for row in df_grouped.itertuples():

    key = row.Index[0] + '_' + row.Index[2]
    if (key not in data_json.keys()):
        data_json[key] = OrderedDict()
        #data_json[row.Index[0]]['ZSName'] =  row.ZSName
        data_json[key]['Direction'] =  row.Index[2]
        data_json[key]['EKoord'] =  row.EKoord
        data_json[key]['NKoord'] = row.NKoord
        data_json[key]['all'] = df_grouped_all.loc[row.Index[0], row.Index[2]].AnzFahrzeuge


    data_json[key]['h_' + str(row.Index[1])] =  row.AnzFahrzeuge
    
final = pd.DataFrame.from_dict(data_json, orient='index')

final.to_csv('../../data/traffic/traffic_direction.csv', sep=',')