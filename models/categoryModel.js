//categoryModel.js

const mongoose= require('mongoose');

//create database schema
const categorySchema= new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true,'Category required'],
            // unique: [true,'Category must be unique'],
            minlength :[3,'Too short category name'],
            maxlength:[32, 'Too long category name']
        },
        slug:{  //replace each space to - and every uppercase letter to a lowercase one
            type: String,
            lowercase: true 
        },
        image: String
    }, 
    {timestamps: true} 
);

const setImgUrl= (doc)=>{
    if(doc.image)
    {
        const imgUrl= `${process.env.BaseURL}/products/${doc.image}`;
        doc.image= imgUrl;
    }
}

categorySchema.post('init', (doc)=> {//?
   setImgUrl(doc);
});
categorySchema.post('save',(doc)=>{//?
    setImgUrl(doc);
})
    

//create model
module.exports= mongoose.model('Category',categorySchema);











//notices
//post('save'): Runs after a document is successfully saved to the database(in the createCategory and updateCategory).
//the body of schema.post('save') is executed after the document has been saved to the database, not before.

//post('init'): Runs after a document is retrieved from the database(in the getCategory and getCategories).
// After the document is retrieved, the post('init') hook will modify the image field to contain a fully-qualified URL, if applicable.
// both post('init') and post('save') help us to return the image url in the response
// while still saving only the image name in the database.




