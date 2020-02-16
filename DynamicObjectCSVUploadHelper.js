({
	searchHelper : function(component,event,getInputKeyword) {
        var action= component.get('c.getAllObjects');
        action.setParams({
            'searchKeyword':getInputKeyword
        });
        action.setCallback(this, function(response){
            var state= response.getState();
            if(state === 'SUCCESS'){
                var responseValue= response.getReturnValue();
                if(responseValue.length == 0){
                    component.set('v.message','No Results Found ....')
                }else{
                    component.set('v.message', 'Search Result..');
                }
                component.set("v.listofSelectedRecord", responseValue);
            }
            
        });
        $A.enqueueAction(action);
	}
})