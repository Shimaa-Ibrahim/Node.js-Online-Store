const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required : true
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    resetToken : String,
    resetTokenExpiration : Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

// add to cart
userSchema.methods.addToCart = function(product, quant = null){
    const prodIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let quantity = quant;
    const updatedCartArray = [...this.cart.items];

    if (prodIndex >= 0) {
        quantity = quant? quant : parseInt(updatedCartArray[prodIndex].quantity) + 1;
        updatedCartArray[prodIndex].quantity = quantity;
    } else {
        updatedCartArray.push({
            productId: product._id,
            quantity: 1
        });
    }
    this.cart = {
        items: updatedCartArray
    };

    return this.save();
};

// remove from cart
userSchema.methods.removeFromCart = function (id){
    const updatedCartArray = this.cart.items.filter(item => {
        return item._id.toString() !== id.toString();
    });
    this.cart.items = updatedCartArray;
    return this.save();
};
// clear cart
userSchema.methods.clearCart = function (){
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model("User", userSchema);
