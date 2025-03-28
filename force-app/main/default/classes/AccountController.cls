public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static List<AccountList> getAccounts(String ownerId){
        try {
            List<AccountList> accList = new List<AccountList>();
            for(Account acc : [SELECT Id, Name, Type, BillingCountry,(SELECT Id FROM Opportunities) FROM Account WHERE OwnerId =:ownerId WITH USER_MODE]){
                AccountList accListObj = new AccountList();
                accListObj.accountId = acc.Id;
                accListObj.accName = acc.Name;
                accListObj.accType = acc.Type;
                accListObj.accBillingCountry = acc.BillingCountry;
                accListObj.numberOfOpportunities = acc.Opportunities.size();
                accList.add(accListObj);
            }
            return accList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean deleteAccount(String accountId){
        try {
            // List<Opportunity> listOfOpportunities = [SELECT Id, Name, AccountId FROM Opportunity WHERE AccountId =: accountId AND IsClosed != TRUE];
            // if(!listOfOpportunities.isEmpty()){
            //     List<Account> accToDelete = [SELECT Id, Name FROM Account WHERE Id =: accountId];
            //     delete accToDelete;
            //     return true;

            // Map<Id, Opportunity> mapOfAccountToOpportunity = new Map<Id, Opportunity>();
            List<Account> accountToDelete = [SELECT Id FROM Account WHERE Id =: accountId];
            List<Opportunity> listOfOpenOpportunities = new List<Opportunity>();
            List<Opportunity> listOfClosedOpportunities = new List<Opportunity>();
                for(Opportunity opp : [SELECT Id, Name, AccountId, StageName, isClosed FROM  Opportunity WHERE AccountId =: accountId WITH USER_MODE]){
                    if(opp.isClosed == FALSE){
                        // mapOfAccountToOpportunity.put(opp.AccountId, opp);
                        listOfOpenOpportunities.add(opp);
                    }
                    else if(opp.isClosed == TRUE){
                        listOfClosedOpportunities.add(opp);
                    }
                }

                if(!listOfOpenOpportunities.isEmpty()){
                    AccountList accList = new AccountList();
                    return false;
                }
                else if(listOfOpenOpportunities.isEmpty() && !listOfClosedOpportunities.isEmpty()){
                    delete listOfClosedOpportunities;
                    delete accountToDelete;
                    return true;
                }
                else{
                    delete accountToDelete;
                    return true;
                }
            }
            catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        } 

    public class AccountList{
        @AuraEnabled
        public String accountId;
        @AuraEnabled
        public String accName;
        @AuraEnabled
        public String accType;
        @AuraEnabled
        public String accBillingCountry;
        @AuraEnabled
        public Integer numberOfOpportunities;
        // @AuraEnabled
        // public String successMessage;
        // @AuraEnabled
        // public String errorMessage;
    }
}