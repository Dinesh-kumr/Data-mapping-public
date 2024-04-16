# DataMapping:
Data mapping is the process of matching fields from one database to another. It's the first step to facilitate data migration, data integration, and other data management tasks.

## Installation
You can install the data-mapping-lib package using npm:
**` npm install data-mapping-lib `**
## Usage
# Importing the Component
Import the DataMappingComponent into your Angular project:
**` import { DataMappingComponent } from 'data-mapping-lib'; `**

## Using the Component
Add the <data-mapping> component in your Angular template:
**' <data-mapping [inputDataList]="inputDataList" [outputDataList]="outputDataList" [mappingList]="mappingList"></data-mapping> `**

## Component Inputs
**inputDataList: An array of objects representing the input data fields.
outputDataList: An array of objects representing the output data fields.
mappingList: An array of objects representing the mappings between input and output fields.**

## inputDataList
The inputDataList array represents the input data fields that will be mapped. Each object in the array should have the following structure:

title: (string) The title or label for this set of input data fields.
isExpand: (boolean) A flag indicating whether this set of fields should be initially expanded or collapsed in the UI.
attributes: (array of strings) List of attribute names representing the input data fields.

## Example:
**inputDataList: any[] = [
  {
    title: "Customer",
    isExpand: false,
    attributes: ["first_name %7", 'familyName', 'email', 'gender', "Dob"]
  },
  {
    title: "Customer2",
    isExpand: true,
    attributes: ['first_name', 'familyName', 'email']
  },
];**

## outputDataList
The outputDataList array represents the output data fields that will be mapped to. Each object in the array should have the following structure:

title: (string) The title or label for this set of output data fields.
isExpand: (boolean) A flag indicating whether this set of fields should be initially expanded or collapsed in the UI.
attributes: (array of strings) List of attribute names representing the output data fields.
## Example:
**outputDataList: any[] = [
  {
    title: "CDP_Customer",
    isExpand: true,
    attributes: ['firstname', 'lastname', 'middlename', 'name', 'phone', 'emailAddress']
  },
  {
    title: "CDP_2",
    isExpand: false,
    attributes: ['first_name', 'familyName', 'email', 'gender']
  }
];**

## mappingList:
The mappingList array represents the mappings between input and output data fields. Each object in the array should have the following structure:
titleKey: (string) The key or identifier for the output data set to be mapped.
attributes: (object) Key-value pairs where the key is the output data field name and the value is the corresponding input data field path.
## Example:
**mappingList: any[] = [
 {
   titleKey: "CDP_Customer",
    attributes: {
      firstname: "Customer.first_name %7",
      lastname: "Customer.familyName",
      emailAddress: "Customer.email"
    }
  },
  {
    titleKey: "CDP_2",
    attributes: {
      first_name: "Customer2.first_name"
    }
  }
];**

## Demo Example: 
**[https://data-mapping-host.web.app/]**
