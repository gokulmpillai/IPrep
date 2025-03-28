import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateContactModal extends LightningModal  {
    @api content;

    successHandler(event){
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Contact created successfuly',
            variant: 'success'
        }))
        this.close('okay');
    }

    errorHandler(){
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: 'Something went wrong',
            variant: 'error'
        }))
        this.close('okay');
    }
}