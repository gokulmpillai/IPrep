import { LightningElement, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import deleteAccount from '@salesforce/apex/AccountController.deleteAccount';
import Id from '@salesforce/user/Id';
import MyModal from 'c/createContactModal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from "@salesforce/apex";

const COLUMNS = [{label : 'Account Name', fieldName: 'accLink', type:'url', typeAttributes:{label: {fieldName:'accName'}, target:'_blank'}},
                 {label : 'Account Type', fieldName: 'accType'},
                 {label : 'Billing Country', fieldName: 'accBillingCountry'},
                 {label : 'Total Opportunities', fieldName: 'numberOfOpportunities'},
                 {
                    type: "button", label: 'New Contact', initialWidth: 150, typeAttributes: {
                        label: 'New Contact',
                        name: 'New Contact',
                        title: 'New Contact',
                        disabled: false,
                        value: 'New Contact',
                        iconPosition: 'left',
                        iconName:'utility:add',
                        variant:'Brand'
                    }
                },
                {
                    type: "button", label: 'Delete', initialWidth: 110, typeAttributes: {
                        label: 'Delete',
                        name: 'Delete',
                        title: 'Delete',
                        disabled: false,
                        value: 'delete',
                        iconPosition: 'left',
                        iconName:'utility:delete',
                        variant:'destructive'
                    }
                }
                 ];

export default class AccountList extends LightningElement {
    userId = Id;
    containsAccount=false;
    data;
    columns=COLUMNS;
    accountId;
    showTemplate=false;
    modalParam;
    wiredAccountsResult;

    @wire(getAccounts, { ownerId: '$userId' })
    wiredAccounts(result) {
        this.wiredAccountsResult = result; // Store result for refreshApex
        if (result.data) {
            let tempData = JSON.parse(JSON.stringify(result.data));
            tempData.forEach(element => {
                element.accLink = '/' + element.accountId;
            });
            this.data = tempData;
            this.containsAccount = tempData.length > 0;
            console.log('Current User Id: ' + this.userId);
            console.log('Data Received: ' + JSON.stringify(tempData));
        } else if (result.error) {
            console.log(result.error.body.message);
        }
    }

callRowAction(event){
    this.accountId = event.detail.row.accountId
    console.log(event.detail.row.accountId);
    if(event.detail.action.name == 'New Contact'){
        this.showTemplate=true;
        this.handleClick();
    }
    if(event.detail.action.name == 'Delete'){
        this.deleteSelectedAccount(this.accountId);
    }
}

async handleClick(accountId) {
    this.modalParam = accountId; 
    const result = await MyModal.open({
        // `label` is not included here in this example.
        // it is set on lightning-modal-header instead
        size: 'large',
        description: 'Accessible description of modal\'s purpose',
        content: this.modalParam,
    });
    // if modal closed with X button, promise returns result = 'undefined'
    // if modal closed with OK button, promise returns result = 'okay'
    console.log(result);
}

deleteSelectedAccount(){
    deleteAccount({accountId : this.accountId})
    .then((result)=>{
        if(result){
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Account deleted successfuly',
                variant: 'success'
            }))
            return refreshApex(this.wiredAccountsResult);
        }
        else{
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'This account cannot be deleted as it has more than one or more open opportunities associated with it.',
                variant: 'error'
            }))
        }
    })
    .catch((error)=>{
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: error.body.message,
            variant: 'error'
        }))
    })   
}
}