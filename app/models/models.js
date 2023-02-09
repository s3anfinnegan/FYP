module.exports = mongoose => {
  var schema = mongoose.Schema(
    //transactions schema
    //-Logo() -Date(epoch) -Items(Stirng) -Price(long) -Tax(long) -Tax%(long) -Total(long) -Server(string) -Barcode/Code(long)
    {
      shop_name: String,
      item1: String,
      item2: String,
      item3: String,
      cashier: String,
      published: Boolean
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Receipt = mongoose.model("receipt", schema);
  return Receipt;
};