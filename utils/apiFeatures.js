// apiFeatures.js 
class ApiFeatures {
    constructor(mongooseQuery,queryObject){
        this.mongooseQuery= mongooseQuery;
        this.queryObject= queryObject;
    }

    filter(){
        let queryObj= {...this.queryObject};
        const execludeFields= ['limit','page','sort','fields','keyword'];
        execludeFields.forEach(field=> delete queryObj[field]); // [field]=> bracket notation, .field=> dot notation.
        //Apply filtering using [gte, gt, lte, lt]
        let stringQuery= JSON.stringify(queryObj);
        stringQuery= stringQuery.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`);
        queryObj= JSON.parse(stringQuery);

        this.mongooseQuery= this.mongooseQuery.find(queryObj);
        return this;
    }
    
    sort(){
        if(this.queryObject.sort){
            const sortBy= this.queryObject.sort.split(',').join(' ');            //query in postman=> ?sort=-sold,price but we need to pass "-sold price" to the sort function
            this.mongooseQuery= this.mongooseQuery.sort(sortBy);        
        } else{
            this.mongooseQuery= this.mongooseQuery.sort('-createdAt');  //based on the newest
        }
        return this;
    }

    limitFields(){
        if(this.queryObject.fields){
            const fields= this.queryObject.fields.split(',').join(' ');        //query in postman=> ?fields=title,price,imageCover

            this.mongooseQuery.select(fields+' -_id');
        } else {
            this.mongooseQuery.select('-__v');
        }
        return this;
    }

    search(modelName){
        if(this.queryObject.keyword){
            let query= {};
            if(modelName === 'ProductModel')
            {
                query.$or= [
                    {title: { $regex: this.queryObject.keyword, $options: 'i'}},
                    {description: {$regex: this.queryObject.keyword, $options:'i'}}
                ];
            }
            else{
                query= {name:{$regex: this.queryObject.keyword,$options: 'i'}}; 
            }
            this.mongooseQuery= this.mongooseQuery.find(query);
        }
        return this;
    }

    paginate(docCount){
        const page= +this.queryObject.page|| 1;
        const limit= +this.queryObject.limit|| 50; 
        const skip= (page-1)* limit;
        
        const endIndex= limit* page;
        this.paginationResult= {};
        //current page
        this.paginationResult.currPage= page;
        //limit
        this.paginationResult.limit= limit;
        //number of documents
        this.paginationResult.numberOfPages= Math.ceil(docCount/limit);
        //next page
        if( docCount > endIndex)
            this.paginationResult.next= page+1;
        if(skip > 0)
            this.paginationResult.previous= page-1;

        this.mongooseQuery= this.mongooseQuery.skip(skip).limit(limit);
        return this;
    }
};
module.exports= ApiFeatures;