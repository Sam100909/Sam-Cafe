import { addDoc, collection, getDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, firebaseReady } from "./firebase-service.js";
import { getCart, getUser, cartStatus, clearAfterOrder } from "./auth-cart.js";

export function initOrders(resolveMenu, whatsappNumber) { document.getElementById("checkoutForm").addEventListener("submit", event => submit(event, resolveMenu, whatsappNumber)); }
async function submit(event, resolveMenu, whatsappNumber) {
  event.preventDefault(); const user=getUser(), cart=getCart(), data=Object.fromEntries(new FormData(event.target).entries());
  if (!user) return cartStatus("Please sign in first."); if (!firebaseReady) return cartStatus("Ordering needs a live Firebase menu."); if (!cart.length) return cartStatus("Your cart is empty.");
  if (!data.customerName.trim() || !data.phone.trim() || !(data.orderType === "dine_in" ? data.tableNumber.trim() : data.pickupTime)) return cartStatus("Complete the required order details.");
  try {
    const items=[]; for (const row of cart) { const snap=await getDoc(doc(db,"menuItems",row.menuItemId)); if(!snap.exists()||snap.data().available===false) throw new Error("One or more items are no longer available."); const item=snap.data(), quantity=Math.min(20,Math.max(1,row.quantity)); items.push({menuItemId:row.menuItemId,name:item.name,price:Number(item.price),quantity,subtotal:Number(item.price)*quantity,note:row.note||""}); }
    const total=items.reduce((sum,item)=>sum+item.subtotal,0), orderCode=generateOrderCode(), order={userId:user.uid,orderCode,customerName:data.customerName.trim(),phone:data.phone.trim(),orderType:data.orderType,pickupTime:data.orderType==="pickup"?data.pickupTime:"",tableNumber:data.orderType==="dine_in"?data.tableNumber.trim():"",items,total,note:data.note.trim(),status:"pending_whatsapp",createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
    await addDoc(collection(db,"orders"),order); await clearAfterOrder(); const text=`Order ${orderCode}\n\n${items.map(item=>`${item.quantity} x ${item.name} - RM ${item.subtotal.toFixed(2)}`).join("\n")}\n\nTotal: RM ${total.toFixed(2)}\nName: ${order.customerName}\nPhone: ${order.phone}\n${order.orderType==="pickup"?`Pickup: ${order.pickupTime}`:`Table: ${order.tableNumber}`}\nNote: ${order.note||"None"}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,"_blank","noopener"); cartStatus("Order created. Please send the WhatsApp message to notify Sam Cafe.");
  } catch (error) { cartStatus(error.message||"Could not create order. Your cart was kept."); }
}
function generateOrderCode() { const date=new Date(), stamp=`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`, chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let suffix=""; for(let index=0;index<4;index++) suffix+=chars[Math.floor(Math.random()*chars.length)]; return `SC-${stamp}-${suffix}`; }
