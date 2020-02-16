public with sharing class DynamicObjectRetrieval {


public static Map<String, String[]> objFieldMap = new Map<String,String[]>();
@AuraEnabled
public static List<String> getAllObjects (String searchKeyword){
    System.debug('Enter into getAllObjects ::::'+searchKeyword);
    List<String> sObjectList= new List<String>();
    try {
        if(searchKeyword !='' && searchKeyword !=null){
            for(Schema.SObjectType objType: Schema.getGlobalDescribe().Values()){
                Schema.DescribeSObjectResult describeSObjectResultObj = objType.getDescribe();
                if(!describeSObjectResultObj.isCustom()){
                    String name = objType.getDescribe().getName();
                    System.debug('name::'+name);
                    if(name !=null &&
                       !name.containsIgnoreCase('history') &&
                       !name.containsIgnoreCase('tag') &&
                       !name.containsIgnoreCase('share') &&
                       !name.containsIgnoreCase('feed') &&
                       name.containsIgnoreCase(searchKeyword)) {
                           sObjectList.add(name);
                       }
                }
            }
            System.debug('sObject List::::'+sObjectList+'~~~~'+sObjectList.size());
             //return sObjectList;
        }
       // return sObjectList;
    } catch(Exception e){
        
    }
     return sObjectList;
}

public static void getMandatoryValues(){
    objFieldMap.put('Account_INSERT', new String[] {'Name', 'Industry', 'Type', 'Description'});
    objFieldMap.put('Account_UPDATE', new String[] {'Id', 'Name', 'Industry', 'Type', 'Description'});
    objFieldMap.put('Account_DELETE', new String[] {'Id'});
    objFieldMap.put('Contact', new String[] {'FirstName', 'LastName'});
    objFieldMap.put('Opportunity', new String[] {'Name', 'StageName'});
    
}

@AuraEnabled
public static void processData(String fileData, String sObjectName, String operation) {
    System.debug('Entering into processData:::::'+fileData+'~~~~~~~'+sObjectName);
    try {
       getMandatoryValues();
       List<String> fieldList= objFieldMap.get(sObjectName+'_'+operation);
       Schema.SObjectType targetType= Schema.getGlobalDescribe().get(sObjectName);
       if(fileData !=null){
           String[] fileName= new String[]{};
           fileName=fileData.split('\n');
           System.debug('fileName::::'+fileName);
           List<sObject> objList= new List<sObject>();
           for(Integer i=1, j=fileName.size();i<j;i++){
               system.debug('filename.size:::'+j);
               String[] inputValues= new String[]{};
               inputValues=fileName[i].split(',');
               System.debug('inputValues:::'+inputValues);
               sObject obj = targetType.newSObject();
               Integer rowsize=inputValues.size();
               System.debug('rowSize::::'+rowSize);
               for(Integer l=0; l< rowsize; l++){
                   System.debug('fields.get::::'+fieldList.get(l));
                   System.debug('inputValues[l]::::'+inputValues[l]);
                   if(String.isNotBlank(inputValues[l])) {
                        if(fieldList.get(l) =='Id') {
                            System.debug('Enters loop 1::::'+l);
                           String val=String.valueOf(inputvalues[l]);
                           obj.put(fieldList.get(l),val);
                           System.debug('Map::::'+obj);
                       } else {
                       String value= inputvalues[l].length()>255 ? inputvalues[l].substring(0,254) : inputvalues[l];
                       obj.put(fieldList.get(l),value);
                       System.debug('Map 1:::'+obj);
                       }
                   } else{
                       System.debug('Enters last else:::');
                       obj.put(fieldList.get(l),'');
                       System.debug('obj:::'+obj);
                   }
               }  
               objList.add(obj);
               System.debug('objlist:::'+objList);
           }
           System.debug('objList::::'+objList);
           if(objList.size() > 0){
              
               if(operation.equalsIgnoreCase('INSERT')){
                   insert objList;
               } else if(operation.equalsIgnoreCase('UPDATE')){
                   update objList;
               } else if(operation.equalsIgnoreCase('UPSERT')){
                   upsert objList;
               } else {
                   Database.DeleteResult[] drList = Database.delete(objList, false);
                   for(Database.DeleteResult dr : drList) {
                        if (dr.isSuccess()) {
                            // Operation was successful, so get the ID of the record that was processed
                            System.debug('Successfully deleted account with ID: ' + dr.getId());
                        }
                        else {
                            // Operation failed, so get all errors                
                            for(Database.Error err : dr.getErrors()) {
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Account fields that affected this error: ' + err.getFields());
                            }
                            }
                        }


               }
       }
       }
    } catch(DmlException e){
        System.debug('A DML exception has occurred:::::'+e.getMessage());
    }
}
}