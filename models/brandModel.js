const mongoose= require('mongoose');

//create database schema
const brandSchema= new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true,'brand required'],
            unique: [true,'brand must be unique'],
            minlength :[3,'Too short brand name'],
            maxlength:[32, 'Too long brand name']
        },
        slug:{
            type: String,
            lowercase: true 
        },
        image: String
    }, 
    {timestamps: true} 
);

//return the image url in the response of createBrand,updateBrand, getBrand, getbrands

const setImgUrl= (doc)=>{
    if(doc.image)
    {
        const imgUrl= `${process.env.BaseURL}/products/${doc.image}`;
        doc.image= imgUrl;
    }
}

brandSchema.post('init', (doc)=> {//?
  setImgUrl(doc);
});
brandSchema.post('save',(doc)=>{//?
    setImgUrl(doc);
});
    


module.exports= mongoose.model('brand',brandSchema);




/*
post('init') ==> the body of it is executed right after any initialization/retrieve of the data(after getOne or getMany operations) 
post('save') this happens right after any save of the data into database (after create and update operations).
*/