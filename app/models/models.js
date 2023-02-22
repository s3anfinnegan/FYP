module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    //transactions schema
    {
      shop_name: String,
      item1: String,
      item2: String,
      item3: String,
      price1: String,
      price2: String,
      price3: String,
      cashier: String,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Receipt = mongoose.model("receipt", schema);
  return Receipt;
};
