# Note: This code is written in Python version 3!

#!/usr/bin/env python
# coding: utf-8

# ## Welcome to your notebook.
# 

# #### Run this cell to connect to your GIS and get started:

# In[2]:


# Needed to save the plotly figures to png. The plotly version on arcgis notebooks was too old, this command updates it
# You need to run the two install commands and then restart the kernel and run all

#!conda install -y -c plotly plotly
#!conda install -y -c plotly python-kaleido


# In[3]:


# IMPORT
from arcgis.gis import GIS # To access the data on ArcGIS Online
import pandas as pd
import numpy as np
import json
import scipy
import math
import plotly.graph_objects as go
from collections import Counter
import plotly.io as pio
from IPython.display import Image

gis = GIS("home") # Connect to the data on your personal ArcGIS Online


# In[4]:


saveFig = False # Save the diagrams to png and html or not


# In[5]:


#### Now you are ready to start!


# In[6]:


# LOAD LAYER
item = GIS().content.get("e5666190b9d14ef09315effbdcff0f5b")
flayer = item.tables[0]


# In[7]:


# NUMBER OF PARTICPANTS
df = flayer.query(where="ID > 53").sdf # All entries before 53 were just to test
print("# participants entered: " + str(len(df.index)))
df = df[df.Task1.notnull()]
print("# participants finished Task 1: " + str(len(df.index)))
df = df[df.Task2.notnull()]
print("# participants finished Task 2: " + str(len(df.index)))
df = df[df.Task3.notnull()]
print("# participants finished Task 3: " + str(len(df.index)))
df = df[df.Task4.notnull()]
print("# participants finished Task 4: " + str(len(df.index)))
df = df[df.Task5.notnull()]
print("# participants finished Task 5: " + str(len(df.index)))
df = df[df.Task6.notnull()]
print("# participants finished Task 6: " + str(len(df.index)))
df = df[df.Task7.notnull()]
print("# participants finished Task 7: " + str(len(df.index)))
df = df[df.Task8.notnull()]
print("# participants finished Task 8: " + str(len(df.index)))


# In[8]:


# List of IDs to exclude
outliers = [63] # 63: veeeery long time (>1h), 247

# CONVERT TO JSON, just different order and easier to loop and access
jsonData = {}
columns = df.columns.tolist()
for index, row in df.iterrows():
    if (row["ID"] not in outliers and row["Task1"] != None and row["Task2"] != None and row["Task3"] != None and row["Task4"] != None and row["Task5"] != None and row["Task6"] != None and row["Task7"] != None and row["Task8"] != None):
        jsonData[row["ID"]] = {}
        for i in range(len(columns)):
            if (row[columns[i]]== None):
                jsonData[row["ID"]][columns[i]] = None
            elif (columns[i] in ["Task1", "Task2", "Task3", "Task4", "Task5", "Task6", "Task7", "Task8", "Orders", "Status"]):
                jsonData[row["ID"]][columns[i]] = json.loads(row[columns[i]]) # parse the json object saves as a string
            elif (columns[i] in ["CreationDate", "EditDate", "DateStarted", "DateEnded"]):
                jsonData[row["ID"]][columns[i]] = str(pd.to_datetime(row[columns[i]]))
            else:
                jsonData[row["ID"]][columns[i]] = row[columns[i]]
print("Number of participants without outliers: " + str(len(jsonData)))


# In[9]:


# CHECK BROWSER
browserNames = []
outliersBrowser = []
for key in jsonData.keys():
    browser = jsonData[key]["Task1"]["browser"];
    # The browser is stored a s along string with different elements. You need to check for different key names in the correct order to get the browser
    if ("Mobile" in browser):
        jsonData[key]["Task1"]["BrowserName"] = "Mobile";
    elif ("Firefox/" in browser and "Seamonkey/" not in browser):
        jsonData[key]["Task1"]["BrowserName"] = "Firefox";
    elif ("Seamonkey/" in browser):
        jsonData[key]["Task1"]["BrowserName"] = "Seamonkey";
    elif ("Chrome/" in browser and "Chromium/" not in browser):
        jsonData[key]["Task1"]["BrowserName"] = "Chrome";
    elif ("Chromium/" in browser):
        jsonData[key]["Task1"]["BrowserName"] = "Chromium";
    elif ("Safari/" in browser and "Chrome/" not in browser and "Chromium/" not in browser):
        jsonData[key]["Task1"]["BrowserName"] = "Safari";
    elif ("Opera/" in browser or "OPR/" in browser):
        jsonData[key]["Task1"]["BrowserName"] = "Opera";
    elif ("MSIE/" in browser or "Trident/" in browser):
        jsonData[key]["Task1"]["BrowserName"] = "IE";
    browserNames.append(jsonData[key]["Task1"]["BrowserName"])
    # The firefox users experiences a bug, so it gets excluded. Also the user study should not be done on a mobile phone
    if (jsonData[key]["Task1"]["BrowserName"] == "Firefox" or jsonData[key]["Task1"]["BrowserName"] == "Mobile"):
        outliersBrowser.append(key);
print(Counter(browserNames))
for key in outliersBrowser:
    jsonData.pop(key)
print("Number of participants without wrong browsers: " + str(len(jsonData)))


# In[10]:


# Store the data as a json, just to save the data
with open('data.json', 'w') as outfile:
    json.dump(jsonData, outfile)


# In[11]:


# QUESTION RESULTS
# Some of the results cannot be parsed automatically. Was obtained with the data from the variable checkParsing
manualCleanup = {100:{1:{"task":6, "correctParsing":29},2:{"task":4, "correctParsing":23}}, 109:{1:{"task":6, "correctParsing":29}}, 112:{1:{"task":4, "correctParsing":140}}, 149:{1:{"task":6, "correctParsing":25.5}}, 188:{4:{"task":4, "correctParsing":140}}, 278:{1:{"task":4, "correctParsing":29}}}
questionsAnswer1 = {}
questionsAnswer2 = {}
answerCheck1 = {}
answerCheck2 = {}
#checkParsing = [];
solution = {
    "Q1_1": [29,21,25], #ambiguous question, several correct answers
    "Q1_2": [19],
    "Q2_1": [32],
    "Q2_2": [26],
    "Q3_1": [455, 469, 1192],
    "Q3_2": [1175, 1192],
    "Q4_1": [2302, 22320],
    "Q4_2": [22320]
}

for key in jsonData.keys():
    questionsAnswer1[key] = {}
    questionsAnswer2[key] = {}
    answerCheck1[key] = {}
    answerCheck2[key] = {}
    for i in range(1,5):
        result1 = jsonData[key]["Task4"][str(i)]["results"]
        result2 = jsonData[key]["Task6"][str(i)]["results"]
        # Just extract the numbers, remove optional text
        res1 = ""
        for character in result1:
            if character.isdigit():
                res1 = res1 + character;
        res2 = ""
        for character in result2:
            if character.isdigit():
                res2 = res2 + character;
        # try to convert to integer
        try:
            res1 = int(res1)
        except:
            res1 = None
        try:
            res2 = int(res2)
        except:
            res2 = None
            
        if (key in manualCleanup.keys()):
            if (i in manualCleanup[key].keys()):
                if (manualCleanup[key][i]["task"] ==4):
                    res1 = manualCleanup[key][i]["correctParsing"];
                if (manualCleanup[key][i]["task"] ==6):
                    res2 = manualCleanup[key][i]["correctParsing"];
        
        # check if the solution is correct
        if (jsonData[key]["Orders"][0]["dimension"] == "3D"):
            questionsAnswer1[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])] = res1
            questionsAnswer2[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])] = res2
            answerCheck1[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])] = res1 in solution["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])]
            answerCheck2[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])] = res2 in solution["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])]

        else:
            questionsAnswer2[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])] = res1
            questionsAnswer1[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])] = res2
            answerCheck2[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])] = res1 in solution["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])]
            answerCheck1[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])] = res2 in solution["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])]
           
        #checkParsing.append({"userId": key,"Question": i, "Task": "4", "original":result1, "parsed": res1})
        #checkParsing.append({"userId": key,"Question": i, "Task": "6", "original":result2, "parsed": res2})

dfAnswers1 = pd.DataFrame.from_dict(questionsAnswer1, orient="index")
dfAnswers2 = pd.DataFrame.from_dict(questionsAnswer2, orient="index")
dfAnswersCheck1 = pd.DataFrame.from_dict(answerCheck1, orient="index")                                                                                                                             
dfAnswersCheck2 = pd.DataFrame.from_dict(answerCheck2, orient="index")                                                                                                                             


"""
dfAnswersCheck1 = pd.DataFrame(index=dfAnswers1.index)
dfAnswersCheck2 = pd.DataFrame(index=dfAnswers2.index)

for key in solution.keys():
    dfAnswersCheck1[key] = dfAnswers1[key].isin(solution[key])
    dfAnswersCheck2[key] = dfAnswers2[key].isin(solution[key])

print(dfAnswersCheck1)
"""

# Convert boolean to 0 or 1
dfAnswersCheck1 = dfAnswersCheck1.astype(float)
dfAnswersCheck2 = dfAnswersCheck2.astype(float)

answersCheckTitles = ["Q1_1","Q1_2","Q2_1","Q2_2","Q3_1","Q3_2","Q4_1","Q4_2", "Avg"]

# Re-order the dataframe to it matched the order of the titles
dfAnswersCheck1 = dfAnswersCheck1[answersCheckTitles[:-1]]
dfAnswersCheck2 = dfAnswersCheck2[answersCheckTitles[:-1]]
#dfCheckParsing = pd.DataFrame(checkParsing)
#dfCheckParsing.to_csv("dfCheckParsing.csv")


# In[12]:


# UEQ AND NASA RESULTS
ueq1 = {}
ueq2 = {}
nasa1 = {}
nasa2 = {}
# Extract the data for the nasa and ueq questionnnaire
for key in jsonData.keys():
    if (jsonData[key]["Task5"] != None and jsonData[key]["Task7"] != None):
        if (jsonData[key]["Orders"][0]["dimension"] == "3D"):
            ueq1[key] = jsonData[key]["Task5"]["ueq"]
            ueq2[key] = jsonData[key]["Task7"]["ueq"]
            temp = jsonData[key]["Task5"].copy()
            temp.pop("ueq")
            nasa1[key] =temp
            temp = jsonData[key]["Task7"].copy()
            temp.pop("ueq")
            nasa2[key] =temp
        else:
            ueq1[key] = jsonData[key]["Task7"]["ueq"]
            ueq2[key] = jsonData[key]["Task5"]["ueq"]
            temp = jsonData[key]["Task7"].copy()
            temp.pop("ueq")
            nasa1[key] =temp
            temp = jsonData[key]["Task5"].copy()
            temp.pop("ueq")
            nasa2[key] =temp
    else:
        print(key)
            
dfUeq1 = pd.DataFrame.from_dict(ueq1, orient="index")
dfUeq2 = pd.DataFrame.from_dict(ueq2, orient="index")
dfNasa1 = pd.DataFrame.from_dict(nasa1, orient="index")
dfNasa2 = pd.DataFrame.from_dict(nasa2, orient="index")
# convert the data to numbers
dfUeq1 = dfUeq1.apply(pd.to_numeric)
dfUeq2 = dfUeq2.apply(pd.to_numeric)
dfNasa1 = dfNasa1.apply(pd.to_numeric)
dfNasa2 = dfNasa2.apply(pd.to_numeric)

ueqTitles = ['Attractiveness','Perspicuity','Efficiency','Dependability','Stimulation','Novelty']
nasaTitles = ['Mental Demand', 'Physical demand', 'Temporal demand', 'Performance', 'Effort', 'Frustration']


# In[13]:


# UEQ MORE PROCESSING
# The UEQ needs reodering and shifting of the numbers in order to be used. There are 26 pairs of adjectives and they all belong one of the six categories 
# The result is a number between 1 and 5, but we want a number between -2 and 2
dfUeq1Norm = dfUeq1.apply(lambda x: x-4 if x.name in [0, 1, 5, 6, 7, 10, 12, 13, 14, 15, 19, 21, 25] else 4-x)
dfUeq2Norm = dfUeq2.apply(lambda x: x-4 if x.name in [0, 1, 5, 6, 7, 10, 12, 13, 14, 15, 19, 21, 25] else 4-x)

# Assign each result to one of the six categories
dfUeq1Norm["Attractiveness"] = (dfUeq1Norm[0] + dfUeq1Norm[11] + dfUeq1Norm[13]+ dfUeq1Norm[23] + dfUeq1Norm[24])/5
dfUeq2Norm["Attractiveness"] = (dfUeq2Norm[0] + dfUeq2Norm[11] + dfUeq2Norm[13]+ dfUeq2Norm[23] + dfUeq2Norm[24])/5
dfUeq1Norm["Perspicuity"] = (dfUeq1Norm[1] + dfUeq1Norm[3] + dfUeq1Norm[12]+ dfUeq1Norm[20])/4
dfUeq2Norm["Perspicuity"] = (dfUeq2Norm[1] + dfUeq2Norm[3] + dfUeq2Norm[12]+ dfUeq2Norm[20])/4
dfUeq1Norm["Efficiency"] = (dfUeq1Norm[8] + dfUeq1Norm[19] + dfUeq1Norm[21]+ dfUeq1Norm[22])/4
dfUeq2Norm["Efficiency"] = (dfUeq2Norm[8] + dfUeq2Norm[19] + dfUeq2Norm[21]+ dfUeq2Norm[22])/4
dfUeq1Norm["Dependability"] = (dfUeq1Norm[7] + dfUeq1Norm[10] + dfUeq1Norm[16]+ dfUeq1Norm[18])/4
dfUeq2Norm["Dependability"] = (dfUeq2Norm[7] + dfUeq2Norm[10] + dfUeq2Norm[16]+ dfUeq2Norm[18])/4
dfUeq1Norm["Stimulation"] = (dfUeq1Norm[4] + dfUeq1Norm[5] + dfUeq1Norm[6]+ dfUeq1Norm[17])/4
dfUeq2Norm["Stimulation"] = (dfUeq2Norm[4] + dfUeq2Norm[5] + dfUeq2Norm[6]+ dfUeq2Norm[17])/4
dfUeq1Norm["Novelty"] = (dfUeq1Norm[2] + dfUeq1Norm[9] + dfUeq1Norm[14]+ dfUeq1Norm[25])/4
dfUeq2Norm["Novelty"] = (dfUeq2Norm[2] + dfUeq2Norm[9] + dfUeq2Norm[14]+ dfUeq2Norm[25])/4

dfUeq1Norm = dfUeq1Norm[ueqTitles]
dfUeq2Norm = dfUeq2Norm[ueqTitles]


# In[14]:


# TIME AND CLICK RESULTS
time1 = {}
time2 = {}
clicks1 = {}
clicks2 = {}

# Extract the data for the number of clicks and task completion time
for key in jsonData.keys():
    if (jsonData[key]["Task5"] != None and jsonData[key]["Task7"] != None):
        time1[key] = {}
        time2[key] = {}
        clicks1[key] = {}
        clicks2[key] = {}
        for i in range(1,5):
            if (jsonData[key]["Orders"][0]["dimension"] == "3D"):
                time1[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])] = jsonData[key]["Task4"][str(i)]['time']
                time2[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])] = jsonData[key]["Task6"][str(i)]['time']

                clicks1[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])] = jsonData[key]["Task4"][str(i)]['clicks']
                clicks2[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])] = jsonData[key]["Task6"][str(i)]['clicks']

            else:
                time2[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])] = jsonData[key]["Task4"][str(i)]['time']
                time1[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])] = jsonData[key]["Task6"][str(i)]['time']

                clicks2[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][0]["version"])] = jsonData[key]["Task4"][str(i)]['clicks']
                clicks1[key]["Q"+str(i)+"_" + str(jsonData[key]["Orders"][1]["version"])] = jsonData[key]["Task6"][str(i)]['clicks']


dfTime1 = pd.DataFrame.from_dict(time1, orient="index").apply(pd.to_numeric)
dfTime2 = pd.DataFrame.from_dict(time2, orient="index").apply(pd.to_numeric)
dfClicks1 = pd.DataFrame.from_dict(clicks1, orient="index").apply(pd.to_numeric)
dfClicks2 = pd.DataFrame.from_dict(clicks2, orient="index").apply(pd.to_numeric)

dfTime1 = dfTime1[answersCheckTitles[:-1]]
dfTime2 = dfTime2[answersCheckTitles[:-1]]

dfClicks1 = dfClicks1[answersCheckTitles[:-1]]
dfClicks2 = dfClicks2[answersCheckTitles[:-1]]


# In[15]:


#POST QUESTIONNAIRE
postQuest = {}

for key in jsonData.keys():
    postQuest[key] = jsonData[key]["Task8"]
dfPostQuest = pd.DataFrame.from_dict(postQuest, orient="index")


# In[16]:


# Calculate the 95% confidence interval from a list of data
def confidence_interval(sample):
    confidence_level = 0.95
    degrees_freedom = sample.size - 1
    sample_mean = np.nanmean(sample,axis=0)
    sample_standard_error = scipy.stats.sem(sample, nan_policy='omit')

    confidence_interval = scipy.stats.t.interval(confidence_level, degrees_freedom, sample_mean, sample_standard_error)
    return confidence_interval


# In[17]:


# make a grouped bar plot with confidence intervals with plotly for the 3D vs 2D case
def make_bar_plot(df1, df2, titles, title, ylabel, saveFig):
    # Calculate the averages and confidence intervals
    data1 = np.nanmean(df1, axis=0)
    error1 = confidence_interval(df1)[1] - data1
    data2 = np.nanmean(df2, axis=0)
    error2 = confidence_interval(df2)[1] - data2
    
    # Case for just one group, one pair of data
    short = False
    if not(type(error1) == np.ndarray):
        short = True
        error1 = [error1]
        error2 = [error2]
        data1 = [data1]
        data2 = [data2]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        name='3D',
        marker_color='#0e7c7b',
        x=titles, y=data1,
        error_y=dict(type='data', array=error1)
    ))
    fig.add_trace(go.Bar(
        name='2D',
        marker_color='#17bebb',
        x=titles, y=data2,
        error_y=dict(type='data', array=error2)
    ))
    fig.update_layout(
    barmode='group',
    title={
        'text': title,
        'y':0.9,
        'x':0.5,
        'xanchor': 'center',
        'yanchor': 'top'},
        font=dict(
        size=15
    ),
    yaxis_title=ylabel,
    )
    fig.update_layout()
    fig.show()
    # Save to png and html
    if saveFig:
        fig.write_html(title + ".html")
        if short:
            pio.write_image(fig, title + ".png",  width=500, format="png", engine="kaleido", scale=3)
        else:
            pio.write_image(fig, title + ".png", width=1000, format="png", engine="kaleido", scale=3)
    


# In[18]:


# make a grouped bar plot with confidence intervals with plotly for the color vs size case
def make_bar_plot_color_size(df1, df2, titles, title, ylabel, saveFig):
    data1 = np.nanmean(df1, axis=0)
    error1 = confidence_interval(df1)[1] - data1
    data2 = np.nanmean(df2, axis=0)
    error2 = confidence_interval(df2)[1] - data2
    
    short = False
    if not(type(error1) == np.ndarray):
        short = True
        error1 = [error1]
        error2 = [error2]
        data1 = [data1]
        data2 = [data2]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        name='Color',
        marker_color='#AE3209',
        x=titles, y=data1,
        error_y=dict(type='data', array=error1)
    ))
    fig.add_trace(go.Bar(
        name='Size',
        marker_color='#f3511b',
        x=titles, y=data2,
        error_y=dict(type='data', array=error2)
    ))
    fig.update_layout(
    barmode='group',
    title={
        'text': title,
        'y':0.9,
        'x':0.5,
        'xanchor': 'center',
        'yanchor': 'top'},
        font=dict(
        size=15
    ),
    yaxis_title=ylabel,
    )
    fig.update_layout()
    fig.show()
    if saveFig:
        fig.write_html(title + ".html")
        if short:
            pio.write_image(fig, title + ".png",  width=500, format="png", engine="kaleido", scale=3)
        else:
            pio.write_image(fig, title + ".png", width=1000, format="png", engine="kaleido", scale=3)


# In[19]:


# Compare the results from the UEQ to some benchmarks
def get_benchmarks(df1, df2):
    # Load and display the benchmarks
    columns = ["Attractiveness", "Perspicuity", "Efficiency", "Dependability", "Stimulation", "Novelty"]
    data = {
    "Excellent": [1.75, 2.07, 1.70, 1.70, 1.56, 1.12],
    "Good": [1.41, 1.84, 1.43, 1.53, 1.10, 0.87],
    "Above average": [0.96, 1.14, 0.98, 1.19, 0.69, 0.49],
    "Below average": [0.44, 0.65, 0.50, 0.81, 0.07, -0.22]
    }
    dfBenchmarks = pd.DataFrame(columns = columns)
    dfBenchmarks.loc["Excellent"] = data["Excellent"]
    dfBenchmarks.loc["Good"] = data["Good"]
    dfBenchmarks.loc["Above average"] = data["Above average"]
    dfBenchmarks.loc["Below average"] = data["Below average"]
    dfBenchmarks.loc["Far below average"] = [-100, -100, -100, -100, -100, -100]
    display(dfBenchmarks[:-1])

    data1 = np.nanmean(df1, axis=0)
    data2 = np.nanmean(df2, axis=0)

    # Check in what category the results are
    dfBench = pd.DataFrame(data, columns = ["3D", "2D"])
    dfBench.loc["Attractiveness"] = [dfBenchmarks.iloc[::-1].index[dfBenchmarks["Attractiveness"].iloc[::-1].searchsorted(data1[0],  side='right')-1],dfBenchmarks.iloc[::-1].index[dfBenchmarks["Attractiveness"].iloc[::-1].searchsorted(data2[0],  side='right')-1]]   
    dfBench.loc["Perspicuity"] = [dfBenchmarks.iloc[::-1].index[dfBenchmarks["Perspicuity"].iloc[::-1].searchsorted(data1[1],  side='right')-1],dfBenchmarks.iloc[::-1].index[dfBenchmarks["Perspicuity"].iloc[::-1].searchsorted(data2[1],  side='right')-1]]   
    dfBench.loc["Efficiency"] = [dfBenchmarks.iloc[::-1].index[dfBenchmarks["Efficiency"].iloc[::-1].searchsorted(data1[2],  side='right')-1],dfBenchmarks.iloc[::-1].index[dfBenchmarks["Efficiency"].iloc[::-1].searchsorted(data2[2],  side='right')-1]]   
    dfBench.loc["Dependability"] = [dfBenchmarks.iloc[::-1].index[dfBenchmarks["Dependability"].iloc[::-1].searchsorted(data1[3],  side='right')-1],dfBenchmarks.iloc[::-1].index[dfBenchmarks["Dependability"].iloc[::-1].searchsorted(data2[3],  side='right')-1]]   
    dfBench.loc["Stimulation"] = [dfBenchmarks.iloc[::-1].index[dfBenchmarks["Stimulation"].iloc[::-1].searchsorted(data1[4],  side='right')-1],dfBenchmarks.iloc[::-1].index[dfBenchmarks["Stimulation"].iloc[::-1].searchsorted(data2[4],  side='right')-1]]   
    dfBench.loc["Novelty"] = [dfBenchmarks.iloc[::-1].index[dfBenchmarks["Novelty"].iloc[::-1].searchsorted(data1[5],  side='right')-1],dfBenchmarks.iloc[::-1].index[dfBenchmarks["Novelty"].iloc[::-1].searchsorted(data2[5],  side='right')-1]]   
    display(dfBench)


# In[20]:


# make pie chart for post and pre questionnaire data
def make_pie_chart(data, categories, title, saveFig):
    colors = ["#17bebb", "#f3511b", "#0e7c7b", "#e0ca3c", "#03256c", "#625f63"]
    fig = go.Figure(data=[go.Pie(labels=categories, values=data)])
    fig.update_traces(marker=dict(colors=colors))
    fig.update_layout(title={
        'text': title,
        'y':0.9,
        'x':0.5,
        'xanchor': 'center',
        'yanchor': 'top'}, 
        font=dict(
        size=15
    ))

    fig.show()
    if saveFig:
        pio.write_image(fig, title + ".png", width=500, format="png", engine="kaleido", scale=3)
        fig.write_html(title + ".html")


# In[21]:


# Make the stacked horizontal bar chart for the Likert scale data. (Copied from the internet)
def make_likert_chart(data, y_data, title, saveFig):
    top_labels = ['Strongly<br>agree', 'Agree', 'Neutral', 'Disagree',
              'Strongly<br>disagree']
    top_labels.reverse()
    colors = ['#c1faf9', '#94dbda',
          '#68bbba', '#3b9c9b',
          '#0e7c7b']
    fig = go.Figure()
    
    # make percentage data!
    x_data = []
    for i in range(0, len(data)):
        tempp = []
        for j in range(len(data[0])):
           tempp.append(int(round(100.0 / float(sum(data[i])) * float(data[i][j]), 0)))
        x_data.append(tempp)


    for i in range(0, len(x_data[0])):
        for xd, yd in zip(x_data, y_data):
            fig.add_trace(go.Bar(
                x=[xd[i]], y=[yd],
                orientation='h',
                marker=dict(
                    color=colors[i],
                    line=dict(color='rgb(248, 248, 249)', width=1)
                )
            ))

    fig.update_layout(
        xaxis=dict(
            showgrid=False,
            showline=False,
            showticklabels=False,
            zeroline=False,
            domain=[0.15, 1]
        ),
        yaxis=dict(
            showgrid=False,
            showline=False,
            showticklabels=False,
            zeroline=False,
        ),
        barmode='stack',
        paper_bgcolor='#f5f6f4',
        plot_bgcolor='#f5f6f4',
        margin=dict(l=120, r=10, t=140, b=80),
        showlegend=False,
    )

    annotations = []

    for yd, xd in zip(y_data, x_data):
        # labeling the y-axis
        annotations.append(dict(xref='paper', yref='y',
                                x=0.14, y=yd,
                                xanchor='right',
                                text=str(yd),
                                font=dict(family='Arial', size=14,
                                          color='rgb(67, 67, 67)'),
                                showarrow=False, align='right'))
        # labeling the first percentage of each bar (x_axis)
        annotations.append(dict(xref='x', yref='y',
                                x=xd[0] / 2, y=yd,
                                text=str(xd[0]) + '%',
                                font=dict(family='Arial', size=14,
                                          color='#625f63'),
                                showarrow=False))
        # labeling the first Likert scale (on the top)
        if yd == y_data[-1]:
            annotations.append(dict(xref='x', yref='paper',
                                    x=xd[0] / 2, y=1.1,
                                    text=top_labels[0],
                                    font=dict(family='Arial', size=14,
                                              color='rgb(67, 67, 67)'),
                                    showarrow=False))
        space = xd[0]
        for i in range(1, len(xd)):
                # labeling the rest of percentages for each bar (x_axis)
                annotations.append(dict(xref='x', yref='y',
                                        x=space + (xd[i]/2), y=yd,
                                        text=str(xd[i]) + '%',
                                        font=dict(family='Arial', size=14,
                                                  color='rgb(248, 248, 255)'),
                                        showarrow=False))
                # labeling the Likert scale
                if yd == y_data[-1]:
                    annotations.append(dict(xref='x', yref='paper',
                                            x=space + (xd[i]/2), y=1.1,
                                            text=top_labels[i],
                                            font=dict(family='Arial', size=14,
                                                      color='rgb(67, 67, 67)'),
                                            showarrow=False))
                space += xd[i]

    fig.update_layout(annotations=annotations)
    fig.show()
    if saveFig:
        pio.write_image(fig, title + ".png", format="png", width=1000, engine="kaleido", scale=3)
        fig.write_html(title + ".html")


# In[22]:


# Split some set of data by the three user personas groups
def splitByPersona(df1, df2):
    df1Personas = pd.concat([df1, dfPostQuest['user_persona']], axis=1, join="inner")
    df2Personas = pd.concat([df2, dfPostQuest['user_persona']], axis=1, join="inner")

    df1P1 = df1Personas[df1Personas["user_persona"] == "1"].drop("user_persona", axis=1)
    df1P2 = df1Personas[df1Personas["user_persona"] == "2"].drop("user_persona", axis=1)
    df1P3 = df1Personas[df1Personas["user_persona"] == "3"].drop("user_persona", axis=1)

    df2P1 = df2Personas[df2Personas["user_persona"] == "1"].drop("user_persona", axis=1)
    df2P2 = df2Personas[df2Personas["user_persona"] == "2"].drop("user_persona", axis=1)
    df2P3 = df2Personas[df2Personas["user_persona"] == "3"].drop("user_persona", axis=1)
    return [[df1P3, df1P1, df1P2],[df2P3, df2P1, df2P2]]


# In[23]:


# Split the data by questions which were about data with color and such that were abou size
def splitColorSize(df1, df2):
    df1["3D"] = np.nanmean(df1[["Q1_1","Q1_2","Q2_1","Q2_2"]], axis=1)
    df2["2D"] = np.nanmean(df2[["Q1_1", "Q1_2", "Q2_1", "Q2_2"]], axis=1)
    dfColor = pd.concat([df1["3D"], df2["2D"]], axis=1, join="inner")
    dfColor["Avg"] = np.nanmean(dfColor, axis=1)
    
    df1["3D"] = np.nanmean(df1[["Q3_1", "Q3_2", "Q4_1", "Q4_2"]], axis=1)
    df2["2D"] = np.nanmean(df2[["Q3_1", "Q3_2", "Q4_1", "Q4_2"]], axis=1)
    dfSize = pd.concat([df1["3D"], df2["2D"]], axis=1, join="inner")
    dfSize["Avg"] = np.nanmean(dfSize, axis=1)
    df1 = df1.drop(["3D"], axis =1)
    df2 = df2.drop(["2D"], axis =1)
    return {"color": dfColor, "size": dfSize}


# In[24]:


# Make a grouped bar chart like before but split by user personas (6 bars in one group)
def make_bar_plot_personas(df1, df2, titles, title, ylabel, saveFig):
    personas = ["Layperson", "Intermediate", "Professional"]
    dfs = splitByPersona(df1, df2)
    fig = go.Figure()
    
    for i in range(len(dfs[0])):
        data1 = np.nanmean(dfs[0][i], axis=0)
        error1 = confidence_interval(dfs[0][i])[1] - data1
        fig.add_trace(go.Bar(
            name='3D -' + personas[i],
            marker_color='#0e7c7b',
            x=titles, y=data1,
            error_y=dict(type='data', array=error1)
        ))
        
        data2 = np.nanmean(dfs[1][i], axis=0)
        error2 = confidence_interval(dfs[1][i])[1] - data2
        fig.add_trace(go.Bar(
            name='2D -' + personas[i],
            marker_color='#17bebb',
            x=titles, y=data2,
            error_y=dict(type='data', array=error2)
        ))
    fig.update_layout(
    barmode='group',
    title={
        'text': title,
        'y':0.9,
        'x':0.5,
        'xanchor': 'center',
        'yanchor': 'top'},
        font=dict(
        size=15
    ),
    yaxis_title=ylabel,
    )
    fig.update_layout()
    fig.show()
    if saveFig:
        pio.write_image(fig, title + ".png", width=1000, format="png", engine="kaleido", scale=3)
        fig.write_html(title + ".html")


# In[25]:


# Define, if 2D or 3D performed better. Performing better can mean higher value (e.g success rate) or smaller value (e.g clicks) 
def getStrongerDimension(df1, df2, titles):
    personas = ["Layperson", "Intermediate", "Professional"]
    data1 = {}
    data2 = {}
    data1["All"] = np.nanmean(df1, axis=0)
    data2["All"] = np.nanmean(df2, axis=0)
    dfs = splitByPersona(df1, df2)
    for i in range(len(dfs[0])):
        data1[personas[i]] = np.nanmean(dfs[0][i], axis=0)
        data2[personas[i]] = np.nanmean(dfs[1][i], axis=0)
    dfMean1 = pd.DataFrame(data1, index=titles)
    dfMean2 = pd.DataFrame(data2, index=titles)
    return dfMean1 < dfMean2
    


# In[26]:


# Color the p-value backgrounds based on what dimension performed better, for the nasa data
def colorNasa(val):
    significant = val < 0.05
    dimension = getStrongerDimension(dfNasa1, dfNasa2, nasaTitles)
    temp = pd.DataFrame(np.where(~dimension, "background-color: #17bebb", ''),
                            index=val.index, columns=val.columns)
    temp = temp.where(~dimension, "background-color: #0e7c7b")
    temp = temp.where(~significant, temp + ";  color:red")
    return temp


# In[27]:


# Color the p-value backgrounds based on what dimension performed better, for the ueq data
def colorUeq(val):
    significant = val < 0.05
    dimension = getStrongerDimension(dfUeq1Norm, dfUeq2Norm, ueqTitles)
    temp = pd.DataFrame(np.where(dimension, "background-color: #17bebb", ''),
                            index=val.index, columns=val.columns)
    temp = temp.where(dimension, "background-color: #0e7c7b")
    temp = temp.where(~significant, temp + ";  color:red")
    return temp


# In[28]:


# Color the p-value backgrounds based on what dimension performed better, for the success rate data
def colorAnswers(val):
    significant = val < 0.05
    dimension = getStrongerDimension(dfAnswersCheck1, dfAnswersCheck2, answersCheckTitles)
    temp = pd.DataFrame(np.where(dimension, "background-color: #17bebb", ''),
                            index=val.index, columns=val.columns)
    temp = temp.where(dimension, "background-color: #0e7c7b")
    temp = temp.where(~significant, temp + ";  color:red")
    return temp


# In[29]:


# Color the p-value backgrounds based on what dimension performed better, for the task completion time data
def colorTime(val):
    significant = val < 0.05
    dimension = getStrongerDimension(dfTime1, dfTime2, answersCheckTitles)
    temp = pd.DataFrame(np.where(~dimension, "background-color: #17bebb", ''),
                            index=val.index, columns=val.columns)
    temp = temp.where(~dimension, "background-color: #0e7c7b")
    temp = temp.where(~significant, temp + ";  color:red")
    return temp


# In[30]:


# Color the p-value backgrounds based on what dimension performed better, for the clicks per task data
def colorClicks(val):
    significant = val < 0.05
    dimension = getStrongerDimension(dfClicks1, dfClicks2, answersCheckTitles)
    temp = pd.DataFrame(np.where(~dimension, "background-color: #17bebb", ''),
                            index=val.index, columns=val.columns)
    temp = temp.where(~dimension, "background-color: #0e7c7b")
    temp = temp.where(~significant, temp + ";  color:red")
    return temp


# In[31]:


# Color the p-value font red if it is statistically significant (p-value < 0.05)
def colorIfSignificant(val):
    color = 'red' if val < 0.05 else ''
    return 'color: %s' % color


# In[32]:


# Perform a t-test for two datasets
def t_test(df1, df2, titles):
    data = {}
    tValues, pValues = scipy.stats.ttest_ind(df1,df2, nan_policy='omit')
    if type(pValues) == np.float64:
        pValues = [pValues]
    for i, p in enumerate(pValues): 
        data[titles[i]] = p
        """
        if (p > 0.05):
            print("{0}: P-Value = {1:.2f} (Not significant)".format(titles[i], p))
        else:
            print("{0}: P-Value = {1:.2f} (Significant!)".format(titles[i], p))
        """
    return data


# In[33]:


# perform the t-test split into user personas
def t_test_personas(df1, df2, titles):
    personas = ["Layperson", "Intermediate", "Professional"]
    data = {}
    data["All"] = t_test(df1, df2, titles)
    dfs = splitByPersona(df1, df2)
    for i in range(len(dfs[0])):
        data[personas[i]] = t_test(dfs[0][i],dfs[1][i], titles)
    df = pd.DataFrame.from_dict(data)
    return df


# In[34]:


# perform the t-test split into size and color
def t_test_ColorSize(df1, df2, titles):
    data = {"T-Test": t_test(df1,df2, titles)}
    df = pd.DataFrame.from_dict(data)
    df = df.style.applymap(colorIfSignificant)
    display(df)


# In[35]:


# Compare color vs size for one dataset
def checkColorSize(df1, df2, title, ylable, saveFig):
    dfCS = splitColorSize(df1, df2)
    display(dfCS["color"])
    make_bar_plot_color_size(dfCS["color"], dfCS["size"], ["3D", "2D", "Average"],  title, ylable, saveFig)
    t_test_ColorSize(dfCS["color"], dfCS["size"], ["3D", "2D", "Average"])
    df1 = df1.drop(["3D"], axis=1)
    df2 = df2.drop(["2D"], axis=1)


# In[36]:


# PRE-QUESTIONNAIRE
preQuest = {}

for key in jsonData.keys():
    preQuest[key] = jsonData[key]["Task2"]
dfPreQuest = pd.DataFrame.from_dict(preQuest, orient="index")

# Age
ageList = dfPreQuest.age.to_list()
ageList = [int(x) for x in ageList if int(x) < 100 and int(x) > 5]

figAge = go.Figure(data=[go.Histogram(x=ageList)])
figAge.update_traces(marker=dict(color='#0e7c7b'))

figAge.update_layout(title={
        'text': "Age",
        'y':0.9,
        'x':0.5,
        'xanchor': 'center',
        'yanchor': 'top'},
        font=dict(
            size=15
    ))
figAge.show()
if saveFig:
    pio.write_image(figAge, "Age.png", format="png", engine="kaleido", scale=3)
    figAge.write_html("Age.html")

# Gender
genderCount = Counter(dfPreQuest.gender.to_list())
make_pie_chart(list(genderCount.values()), list(genderCount.keys()), "Gender", saveFig)

# Education
educationCount = Counter(dfPreQuest.education.to_list())
make_pie_chart(list(educationCount.values()), list(educationCount.keys()), "Education", saveFig)


# In[37]:


likertData = []

# Experience with digital maps
experienceCount = Counter(dfPreQuest.experience.to_list())
likertData.append([experienceCount["1"], experienceCount["2"], experienceCount["3"], experienceCount["4"], experienceCount["5"]])

# Knowledge of the rosengarten project
rosengartenCount = Counter(dfPreQuest.rosengarten.to_list())
likertData.append([rosengartenCount["1"], rosengartenCount["2"], rosengartenCount["3"], rosengartenCount["4"], rosengartenCount["5"]])

# Knowledge of the rosengarten area
knowledgeCount = Counter(dfPreQuest.knowledge.to_list())
likertData.append([knowledgeCount["1"], knowledgeCount["2"], knowledgeCount["3"], knowledgeCount["4"], knowledgeCount["5"]])


make_likert_chart(likertData, ["Experienced with digital maps", "Knowledge of Rosengarten project", "Knowledge of Rosengarten area"], "knowledgeLikert", saveFig)


# In[38]:


# Did you vote last year?
voteCount = Counter(dfPreQuest.vote.to_list())
make_pie_chart(list(voteCount.values()), list(voteCount.keys()), "Vote last year", saveFig)

# Which browser was used?
browserCount = Counter(browserNames)
make_pie_chart(list(browserCount.values()), list(browserCount.keys()), "Browsers used", saveFig)


# In[39]:


# NASA TLX 
make_bar_plot(dfNasa1, dfNasa2, nasaTitles, "NASA TLX Questionnaire", "", saveFig)
make_bar_plot_personas(dfNasa1, dfNasa2, nasaTitles, "NASA TLX Questionnaire - Personas", "", saveFig)
t_test_personas(dfNasa1, dfNasa2, nasaTitles).style.apply(colorNasa,axis=None)


# In[40]:


# USER EXPERIENCE QUESTIONNAIRE
make_bar_plot(dfUeq1Norm, dfUeq2Norm, ueqTitles, "User Experience Questionnaire", "", saveFig)
make_bar_plot_personas(dfUeq1Norm, dfUeq2Norm, ueqTitles, "User Experience Questionnaire - Personas", "", saveFig)
t_test_personas(dfUeq1Norm, dfUeq2Norm, ueqTitles).style.apply(colorUeq,axis=None)


# In[41]:


# SUCCESS RATE
dfAnswersCheck1["Avg"] = np.nanmean(dfAnswersCheck1, axis=1)
dfAnswersCheck2["Avg"] = np.nanmean(dfAnswersCheck2, axis=1)
make_bar_plot(dfAnswersCheck1, dfAnswersCheck2, answersCheckTitles, "Success Rate - Questions", "% of correct Answers", saveFig)
make_bar_plot_personas(dfAnswersCheck1, dfAnswersCheck2, answersCheckTitles, "Success Rate - Personas", "% of correct Answers", saveFig)
t_test_personas(dfAnswersCheck1, dfAnswersCheck2, answersCheckTitles).style.apply(colorAnswers,axis=None)


# In[42]:


checkColorSize(dfAnswersCheck1, dfAnswersCheck2, "Success Rate - Color vs Size, 3Dvs2D", "% of correct Answers", saveFig)


# In[43]:


# TASK COMPLETION TIME
dfTime1["Avg"] = np.nanmean(dfTime1, axis=1)
dfTime2["Avg"] = np.nanmean(dfTime2, axis=1)
make_bar_plot(dfTime1, dfTime2, answersCheckTitles, "Task Completion Time - Questions", "Average time needed per Task [s]", saveFig)
make_bar_plot_personas(dfTime1, dfTime2, answersCheckTitles, "Task Completion Time - Personas", "Average time needed per Task [s]", saveFig)
t_test_personas(dfTime1, dfTime2, answersCheckTitles).style.apply(colorTime,axis=None)


# In[44]:


checkColorSize(dfTime1, dfTime2,  "Task Completion Time - Color vs Size, 3Dvs2D", "Average time needed per Task [s]", saveFig)


# In[45]:


# CLICKS PER TASK
dfClicks1["Avg"] = np.nanmean(dfClicks1, axis=1)
dfClicks2["Avg"] = np.nanmean(dfClicks2, axis=1)
make_bar_plot(dfClicks1, dfClicks2, answersCheckTitles, "Clicks per Task - Questions", "Average clicks needed per task", saveFig)
make_bar_plot_personas(dfClicks1, dfClicks2, answersCheckTitles, "Clicks per Task - Personas", "Average clicks needed per task", saveFig)
t_test_personas(dfClicks1, dfClicks2, answersCheckTitles).style.apply(colorClicks,axis=None)


# In[46]:


checkColorSize(dfClicks1, dfClicks2, "Clicks per Task - Color vs Size, 3Dvs2D", "Average clicks needed per task", saveFig)


# In[47]:


# Make plots for just the average comparing 2D vs 3D (for report)
make_bar_plot(dfAnswersCheck1["Avg"], dfAnswersCheck2["Avg"], ["Success Rate"], "Success Rate - 3D vs 2D", "% of correct Answers", saveFig)
make_bar_plot(dfTime1["Avg"], dfTime2["Avg"], ["Task Completion Time"],  "Task Completion Time - 3D vs 2D", "Average time needed per Task [s]", saveFig)
make_bar_plot(dfClicks1["Avg"], dfClicks2["Avg"], ["Clicks per Task"], "Clicks per Task - 3D vs 2D", "Average clicks needed per task", saveFig)


# In[48]:


# Make plots for just the average comparing color vs size (for report)
dfCS = splitColorSize(dfAnswersCheck1, dfAnswersCheck2)
make_bar_plot_color_size(dfCS["color"]["Avg"], dfCS["size"]["Avg"], ["Success Rate"], "Success Rate - Color vs Size", "% of correct Answers", saveFig)

dfCS = splitColorSize(dfTime1, dfTime2)
make_bar_plot_color_size(dfCS["color"]["Avg"], dfCS["size"]["Avg"], ["Task Completion Time"],  "Task Completion Time - Color vs Size", "Average time needed per Task [s]", saveFig)

dfCS = splitColorSize(dfClicks1, dfClicks2)
make_bar_plot_color_size(dfCS["color"]["Avg"], dfCS["size"]["Avg"], ["Clicks per Task"], "Clicks per Task - Color vs Size", "Average clicks needed per task", saveFig)


# In[49]:


# POST-QUESTIONNAIRE
# User Personas
personasCount = Counter(dfPostQuest.user_persona.to_list())
make_pie_chart([personasCount["3"],personasCount["1"],personasCount["2"]], ["Layman", "Intermediate", "Professional"], "User Persona", saveFig)

# Did it change your opinion?
changeCount = Counter(dfPostQuest.change_vote.to_list())
make_pie_chart([changeCount["yes"],changeCount["no"],changeCount["none"]], ["Yes", "No", "I did/could not vote last year"], "Change of initial opinion", saveFig)

# Do you want more info?
moreInfoCount = Counter(dfPostQuest.more_info.to_list())
make_pie_chart([moreInfoCount["yes"],moreInfoCount["no"]], ["Yes", "No"], "More Information", saveFig)


# In[50]:


# You think such a app could change the opinion of the public?
likertData = []
change2Count = Counter(dfPostQuest.change_vote2.to_list())
likertData.append([change2Count["1"], change2Count["2"], change2Count["3"], change2Count["4"], change2Count["5"]])
make_likert_chart(likertData, ["Could change the opinion"], "changeOpinionLikert", saveFig)


# In[51]:


# BALANCE OF ORDER OF DIMENSION AND QUESTIONS
# Each permutation should be exectuted the same amount of time, here this is checked
def checkOrder(roundNum):
    orders = []
    ordersQuestions = []
    for key in jsonData.keys():
        orders.append(str(jsonData[key]["Orders"]))

        if (roundNum == 1):
            results = jsonData[key]["Task4"] 
        else:
            results = jsonData[key]["Task6"] 
        orderQ = [0,0,0,0]
        for i in ["1", "2", "3", "4"]:
            if (results[i]["order"] != None):
                orderQ[results[i]["order"]] = i;
        ordersQuestions.append(str(orderQ))

    orders = ["3D_1" if x=="[{'dimension': '3D', 'version': 1}, {'dimension': '2D', 'version': 2}]" else x for x in orders]
    orders = ["2D_2" if x=="[{'dimension': '2D', 'version': 2}, {'dimension': '3D', 'version': 1}]" else x for x in orders]
    orders = ["2D_1" if x=="[{'dimension': '2D', 'version': 1}, {'dimension': '3D', 'version': 2}]" else x for x in orders]
    orders = ["3D_2" if x=="[{'dimension': '3D', 'version': 2}, {'dimension': '2D', 'version': 1}]" else x for x in orders]
    countOrders = Counter(zip(orders,ordersQuestions))

    df1 = pd.DataFrame(columns=list(set(orders)), index=list(set(ordersQuestions)))
    for elem in countOrders:
        df1.loc[elem[1],elem[0]] = countOrders[elem]

    df1['TOTAL'] = df1.index.map(Counter(ordersQuestions))
    temp = Counter(orders)
    temp["TOTAL"] = len(jsonData.keys())
    df2 = pd.DataFrame.from_dict({"TOTAL": dict(temp)}, orient="index")
    df = pd.concat([df1, df2])
    display(df)
checkOrder(1)
checkOrder(2)
# Note: Here we discovered an problem, there was a mistake in the code and the second round had much worse performance


# In[52]:


# Download the whole notebooks including all the figures
get_ipython().system('tar chvfz notebook.tar.gz * ')


# In[ ]:




