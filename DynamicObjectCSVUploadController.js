({
	handleChange : function(component, event, helper) {
		var changeValue=event.getParam("value");
        //alert('changeValue:::::::'+changeValue);
        component.set('v.selectedOperation',changeValue);
	},
    
    keyPressController: function(component,event,helper){
        var getInputKeyword= component.get('v.searchKeyword');
        if(getInputKeyword.length > 0){
            var forOpen=component.find('searchRes');
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            helper.searchHelper(component,event,getInputKeyword);
        } else{
            component.set('v.listofSelectedRecord',null);
            var forClose=component.find('searchRes');
            $A.util.addClass(forClose, 'slds-is-close');
            $A.util.removeClass(forClose, 'slds-is-open');
        }
    },
    
    hideSpinner : function(component,event,helper){
        var spinner= component.find('spinner');
        var evt=spinner.get('e.toggle');
        evt.setParams({
            isVisible:false 
        });
        evt.fire();
    },
    
    showSpinner: function(component,event,helper){
        var spinner= component.find('spinner');
        var evt=spinner.get('e.toggle');
        evt.setParams({
            isVisible:true 
        });
        evt.fire();
    },
    
    clear: function(component,event,helper){
        var pillTarget = component.find("lookup-pill");
         var lookUpTarget = component.find("lookupField"); 
        
         $A.util.addClass(pillTarget, 'slds-hide');
         $A.util.removeClass(pillTarget, 'slds-show');
        
         $A.util.addClass(lookUpTarget, 'slds-show');
         $A.util.removeClass(lookUpTarget, 'slds-hide');
      
         component.set("v.searchKeyword",null);
         component.set("v.listofSelectedRecord", null );
    },
    
    handleCompEvent: function(component,event,helper){
        var selectedSObjectEvent= event.getParam('sobjectbyevent');
        component.set('v.selectedRecord', selectedSObjectEvent);
        var forclose = component.find("lookup-pill");
           $A.util.addClass(forclose, 'slds-show');
           $A.util.removeClass(forclose, 'slds-hide');
      
        
        var forclose = component.find("searchRes");
           $A.util.addClass(forclose, 'slds-is-close');
           $A.util.removeClass(forclose, 'slds-is-open');
        
        var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show'); 
    },
    
    handleFileChange: function(component,event,helper){
        var files= event.getSource().get('v.files');
        console.log(files);
        alert('file name::::'+files[0].name);
        alert('file:::'+files.length);
       // alert('file NAme::::'+files.name);
      // var fileInp= component.find('fileInput').getElement();
      // var inp= fileInp.files[0];
       // if(inp){
            var reader= new FileReader();
           // reader.readAsText(inp,'UTF-8');
            reader.onload= function(evt){
                var fl= evt.target.result;
                component.set('v.fileContentData',fl);
                console.log('file Data:::', JSON.stringify(fl));
                var allTextLines=fl.split(/\r\n|\n/);
                var datarows=allTextLines.length-1;
                var headers=allTextLines[0].split(',');
                console.log('Rows Length:::',datarows);
                var noOfRows= component.get('v.NumOfRecords');
                if(datarows > noOfRows+1 || datarows == 1 || datarows == 0){
                    alert('File rows between 1 to '+noOfRows+' . ');
                    component.set('v.showMain', true);
                } else{
                    var lines=[];
                    var fileContentdata='';
                    var content="<table class=\"table slds-table slds-table--bordered slds-table--cell-buffer\">";
                    content += "<thead><tr class=\"slds-text-title--caps\">";
                    for(i=0;i<headers.length; i++){
                        content += '<th scope=\"col"\>'+headers[i]+'</th>';
                    }
                    content += "</tr></thead>";
                    for (var i=1; i<allTextLines.length; i++) {
                        fileContentdata = allTextLines[i].split(',');
                        if(fileContentdata[0]!=''){
                            content +="<tr>";
                            
                            for(var j=0;j<fileContentdata.length;j++){
                                content +='<td>'+fileContentdata[j]+'</td>';
                            }
                            content +="</tr>";
                        }
                    }
                    content += "</table>";
                    component.set('v.tableContent',content);
                }
            }
            reader.readAsText(files[0]);
        //}
    },
    
    databaseOperation: function(component,event,helper){
        alert('enter into operation:::');
        var action=component.get('c.processData');
        action.setParams({
            'fileData': component.get('v.fileContentData'),
            'sObjectName':component.get('v.selectedRecord'),
            'operation': component.get('v.selectedOperation')
        });
        action.setCallback(this, function(response) {
            var state= response.getState();
            if(state === 'SUCCESS') {
                alert('Records '+component.get('v.selectedOperation')+' Successfully');
            } else if(state === 'ERROR'){
                var errors= response.getError();
                if(errors){
                    if(errors[0] && errors[0].message) {
                        console.log('Error Message:::', errors[0].message);
                    }else{
                        console.log('Unknown Error');
                    }
                }
            }
        });
        $A.enqueueAction(action);
    }
})