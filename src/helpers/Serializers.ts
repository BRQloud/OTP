import { Api_calls, Customers } from "@prisma/client";

export const CustomerToString = (customer: Customers):string =>{
  
    return  JSON.stringify({...customer,id: customer.id.toString()})


}




