import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    sku: { type: String },
    category: { type: String },
    price: { type: Number, default: 0 },
    unit: { type: String },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const InventorySchema = new Schema(
  {
    sku: { type: String, required: true },
    product_name: { type: String },
    quantity: { type: Number, default: 0 },
    location: { type: String },
    reorder_level: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    sku: { type: String },
    product_name: { type: String },
    qty: { type: Number, default: 0 },
    unit_price: { type: Number, default: 0 },
    line_total: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    order_no: { type: String },
    customer_name: { type: String },
    customer_id: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
    items: [OrderItemSchema],
    total_amount: { type: Number, default: 0 },
    ordered_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EnquirySchema = new Schema(
  {
    customer_name: { type: String },
    customer_id: { type: Schema.Types.ObjectId, ref: "User" },
    subject: { type: String },
    message: { type: String },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
    created_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RevenueByMonthSchema = new Schema(
  {
    month: { type: String, required: true },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const TopCustomerSchema = new Schema(
  {
    customer_name: { type: String, required: true },
    customer_id: { type: Schema.Types.ObjectId, ref: "User" },
    total_revenue: { type: Number, default: 0 },
    total_orders: { type: Number, default: 0 },
  },
  { _id: false }
);

const ManufacturerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    website: { type: String },

    products: [ProductSchema],
    orders: [OrderSchema],
    pending_enquiries: [EnquirySchema],
    inventory: [InventorySchema],

    revenue_by_month: [RevenueByMonthSchema],
    total_clients: { type: Number, default: 0 },
    top_customers: [TopCustomerSchema],

    product_combination: { type: String },
    price_combination: { type: String },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Manufacturer", ManufacturerSchema);

