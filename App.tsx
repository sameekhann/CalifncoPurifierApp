import React, { useEffect, useMemo, useState } from 'react';
import { auth, db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { SafeAreaView, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthScreen from "./AuthScreen";
const ADMIN_UID = "4LUTwRBiHRNpCT14f5VVQOr9T5k1";

type Role = 'Customer' | 'Dealer' | 'Admin';
type Product = { id: string; name: string; price: number; dealerPrice: number; category: string; image: any; description: string };
type CartItem = { productId: string; quantity: number };
type Order = { id: string; date: string; role: Role; customerName: string; phone: string; address: string; items: CartItem[]; total: number; status: string };
type ServiceRequest = { id: string; name: string; phone: string; address: string; issue: string; status: string };
const CART_KEY = '@califnco_cart_v2';
const ORDERS_KEY = '@califnco_orders_v2';
const SERVICES_KEY = '@califnco_services_v2';
const templates = [
  { name: 'Califnco RO Purifier', category: 'RO', price: 8999, image: require('./assets/img1.jpg'), description: 'Sample reverse osmosis purifier for home use.' },
  { name: 'Califnco UV Purifier', category: 'UV', price: 5499, image: require('./assets/img1.jpg'), description: 'Sample UV water purifier for home use.' },
  { name: 'Califnco Copper RO', category: 'Copper', price: 11999, image: require('./assets/img2.jpg'), description: 'Sample RO purifier with a copper-themed feature.' },
  { name: 'Califnco Alkaline Plus', category: 'Alkaline', price: 10499, image: require('./assets/img2.jpg'), description: 'Sample alkaline purifier listing for demonstration.' },
  { name: 'Califnco UF Purifier', category: 'UF', price: 3999, image: require('./assets/img2.jpg'), description: 'Sample UF purifier for demonstration.' },
];
const products: Product[] = Array.from({ length: 55 }, (_, i) => {
  const t = templates[i % templates.length]; const n = i + 1; const price = t.price + Math.floor(i / 5) * 100;
  return { id: String(n), name: n <= 5 ? t.name : `${t.name} Model ${n}`, category: t.category, price, dealerPrice: Math.round(price * 0.78), image: t.image, description: t.description };
});
const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;
export default function App() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  useEffect(() => {
    const loadFirestoreProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const loadedProducts: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name ?? "Unnamed Product",
            price: Number(data.price ?? 0),
            dealerPrice: Math.round(Number(data.price ?? 0) * 0.78),
            category: data.category ?? "Other",
            description: data.description ?? "",
            image: require("./assets/img1.jpg"),
          };
        });

        setFirestoreProducts(loadedProducts);
        console.log("Firestore products loaded:", loadedProducts.length);
      } catch (error) {
        console.log("Firestore products error:", error);
      }
    };

    loadFirestoreProducts();
  }, []);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);
  const [role, setRole] = useState<Role | null>(null);
  const [screen, setScreen] = useState('Home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  useEffect(() => {
    if (!authUser) {
      setOrdersLoaded(false);
      return;
    }

    const loadOrdersFromFirestore = async () => {
      try {
        const ordersRef = collection(db, "users", authUser.uid, "orders");
        const snapshot = await getDocs(ordersRef);

        const cloudOrders = snapshot.docs.map((orderDoc) => {
          const data = orderDoc.data();

          return {
            ...data,
            id: orderDoc.id,
          } as Order;
        });

        setOrders(cloudOrders);
        console.log("Firestore orders loaded:", cloudOrders.length);
      } catch (error) {
        console.log("Firestore orders load error:", error);
      } finally {
        setOrdersLoaded(true);
      }
    };

    loadOrdersFromFirestore();
  }, [authUser]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  useEffect(() => {
    if (!authUser) {
      setServicesLoaded(false);
      return;
    }

    const loadServicesFromFirestore = async () => {
      try {
        const servicesRef = collection(
          db,
          "users",
          authUser.uid,
          "services"
        );

        const snapshot = await getDocs(servicesRef);

        const cloudServices = snapshot.docs.map((serviceDoc) => {
          const data = serviceDoc.data();

          return {
            ...data,
            id: serviceDoc.id,
          } as ServiceRequest;
        });

        setServices(cloudServices);
        console.log("Firestore services loaded:", cloudServices.length);
      } catch (error) {
        console.log("Firestore services load error:", error);
      } finally {
        setServicesLoaded(true);
      }
    };

    loadServicesFromFirestore();
  }, [authUser]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Product | null>(null);
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [address, setAddress] = useState('');
  const [issue, setIssue] = useState('');
  const [dealerName, setDealerName] = useState('Demo Dealer');
  useEffect(() => { (async () => { try { const c = await AsyncStorage.getItem(CART_KEY); const o = await AsyncStorage.getItem(ORDERS_KEY); const sr = await AsyncStorage.getItem(SERVICES_KEY); if (c) setCart(JSON.parse(c)); if (o) setOrders(JSON.parse(o)); if (sr) setServices(JSON.parse(sr)); } catch (e) { console.warn(e); } finally { setReady(true); } })(); }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)).catch(console.warn); }, [cart, ready]);
  useEffect(() => { if (ready) AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders)).catch(console.warn); }, [orders, ready]);
  useEffect(() => { if (ready) AsyncStorage.setItem(SERVICES_KEY, JSON.stringify(services)).catch(console.warn); }, [services, ready]);
  const allProducts = useMemo(
    () => [...products, ...firestoreProducts],
    [firestoreProducts]
  );

  const filtered = useMemo(
    () =>
      allProducts.filter(
        p =>
          p.name.toLowerCase().includes(search.trim().toLowerCase()) &&
          (category === 'All' || p.category === category)
      ),
    [allProducts, search, category]
  );
  const count = cart.reduce((sum, x) => sum + x.quantity, 0);
  const priceFor = (p: Product) => role === 'Dealer' ? p.dealerPrice : p.price;
  const total = cart.reduce((sum, x) => sum + (products.find(p => p.id === x.productId) ? priceFor(products.find(p => p.id === x.productId)!) : 0) * x.quantity, 0);
  const add = (id: string) => setCart(prev => { const old = prev.find(x => x.productId === id); return old ? prev.map(x => x.productId === id ? { ...x, quantity: x.quantity + 1 } : x) : [...prev, { productId: id, quantity: 1 }]; });
  useEffect(() => {
    if (!ready || !authUser) return;

    const saveCartToFirestore = async () => {
      try {
        await setDoc(
          doc(db, "users", authUser.uid, "appData", "cart"),
          {
            items: cart,
            updatedAt: serverTimestamp(),
          }
        );

        console.log("Cart saved to Firestore");
      } catch (error) {
        console.log("Cart Firestore save error:", error);
     }
    };

    saveCartToFirestore();
  }, [cart, ready, authUser]);
  const change = (id: string, d: number) => setCart(prev => prev.map(x => x.productId === id ? { ...x, quantity: x.quantity + d } : x).filter(x => x.quantity > 0));
  const resetRole = () => { setRole(null); setScreen('Home'); setSearch(''); setCategory('All'); };
  const placeOrder = async () => {
    console.log("PLACE ORDER FUNCTION CALLED");
    if (!cart.length) {
      return Alert.alert('Cart empty', 'Pehle products add karein.');
    }

    if (!name.trim() || !phone.trim() || !address.trim()) {
      return Alert.alert(
        'Details required',
        'Name, phone aur address fill karein.'
      );
    }

    if (phone.replace(/\D/g, '').length < 10) {
      return Alert.alert('Invalid phone', '10 digit phone number enter karein.');
    }

    if (!authUser) {
      return Alert.alert('Login required', 'Pehle login karein.');
    }

    const order: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleString('en-IN'),
      role: role || 'Customer',
      customerName: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: cart.map(x => ({ ...x })),
      total,
      status: 'Pending',
    };

    try {
      await setDoc(
        doc(db, 'users', authUser.uid, 'orders', order.id),
        
        {
          ...order,
          createdAt: serverTimestamp(),
        }
      );
      console.log("ORDER SAVED TO FIRESTORE:", order.id);

      setOrders(prev => [order, ...prev]);
      setCart([]);
      setName('');
      setPhone('');
      setAddress('');
      setScreen('Orders');

      Alert.alert('Order placed', 'Order Firestore mein successfully save ho gaya.');
    } catch (error) {
      console.log('Firestore order save error:', error);
      Alert.alert(
        'Order save failed',
        'Order cloud mein save nahi hua. Internet aur Firestore Rules check karein.'
      );
    }
  };
  
  const bookService = async () => {
    if (!name.trim() || !phone.trim() || !address.trim() || !issue.trim()) {
      return Alert.alert(
        'Details required',
        'Name, phone, address aur issue fill karein.'
      );
    }

    if (phone.replace(/\D/g, '').length < 10) {
      return Alert.alert('Invalid phone', '10 digit phone number enter karein.');
    }

    if (!authUser) {
      return Alert.alert('Login required', 'Pehle login karein.');
    }

    const service = {
      id: `SR-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      issue: issue.trim(),
      status: 'New',
    };

    try {
      await setDoc(
        doc(db, 'users', authUser.uid, 'services', service.id),
        {
          ...service,
          createdAt: serverTimestamp(),
        }
      );

      console.log('SERVICE SAVED TO FIRESTORE:', service.id);

      setServices(prev => [service, ...prev]);
      setName('');
      setPhone('');
      setAddress('');
      setIssue('');
      setScreen('Service');

      Alert.alert(
        'Request saved',
        'Service request Firestore mein successfully save ho gayi.'
      );
    } catch (error) {
      console.log('Firestore service save error:', error);

      Alert.alert(
        'Request save failed',
        'Service request cloud mein save nahi hui. Internet aur Firestore Rules check karein.'
      );
    }
  };

  const btn = (label: string, onPress: () => void, secondary = false) => <TouchableOpacity key={label} style={secondary ? s.secondary : s.button} onPress={onPress}><Text style={secondary ? s.secondaryText : s.buttonText}>{label}</Text></TouchableOpacity>;
  const header = <View style={s.header}><View><Text style={s.logo}>CALIFNCO</Text><Text style={s.tagline}>Pure water. Better living.</Text></View><TouchableOpacity style={s.rolePill} onPress={resetRole}><Text style={s.rolePillText}>{role || 'Choose role'} ▾</Text></TouchableOpacity></View>;
  const nav = role === 'Customer' ? ['Home', 'Cart', 'Orders', 'Service', 'Profile'] : role === 'Dealer' ? ['Catalog', 'Cart', 'Orders', 'Profile'] : ['Dashboard', 'Products', 'Orders', 'Dealers', 'Service'];
  const productCard = (p: Product) => <View key={p.id} style={s.card}><TouchableOpacity style={s.productInfo} onPress={() => { setSelected(p); setScreen('Details'); }}><Image source={p.image} style={s.productImage} resizeMode="contain"/><Text style={s.productName}>{p.name}</Text><Text style={s.price}>{money(priceFor(p))}</Text>{role === 'Dealer' && <Text style={s.dealerHint}>Demo wholesale price</Text>}<Text style={s.categoryLabel}>{p.category} Purifier</Text><Text style={s.detailsHint}>Tap to view details →</Text></TouchableOpacity>{btn('+ Add to Cart', () => add(p.id))}</View>;
  const renderCatalog = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>{role === 'Dealer' ? 'Dealer Wholesale Catalog' : 'Find Your Purifier'}</Text><Text style={s.subtitle}>{role === 'Dealer' ? 'Sample dealer pricing and bulk ordering.' : 'Search and explore our water purifiers.'}</Text><TextInput style={s.input} placeholder="Search products..." placeholderTextColor="#7B8794" value={search} onChangeText={setSearch}/><ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.categoryList}>{['All', 'RO', 'UV', 'Copper', 'Alkaline', 'UF'].map(c => <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[s.categoryButton, category === c && s.selectedCategory]}><Text style={[s.categoryText, category === c && s.selectedCategoryText]}>{c}</Text></TouchableOpacity>)}</ScrollView><Text style={s.section}>Products ({filtered.length})</Text>{filtered.length ? filtered.map(productCard) : <Text style={s.empty}>No products found.</Text>}</ScrollView>;
  const renderCart = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>{role === 'Dealer' ? 'Bulk Order Cart' : 'Your Cart'}</Text>{!cart.length ? <Text style={s.empty}>Your cart is empty.</Text> : <>{cart.map(item => { const p = products.find(x => x.id === item.productId); if (!p) return null; return <View key={p.id} style={s.cartItem}><Image source={p.image} style={s.cartImage} resizeMode="contain"/><View style={s.cartInfo}><Text style={s.productName}>{p.name}</Text><Text style={s.price}>{money(priceFor(p) * item.quantity)}</Text><View style={s.quantityRow}><TouchableOpacity style={s.qtyButton} onPress={() => change(p.id, -1)}><Text style={s.qtyText}>−</Text></TouchableOpacity><Text style={s.quantity}>{item.quantity}</Text><TouchableOpacity style={s.qtyButton} onPress={() => change(p.id, 1)}><Text style={s.qtyText}>+</Text></TouchableOpacity></View></View><TouchableOpacity onPress={() => setCart(prev => prev.filter(x => x.productId !== p.id))}><Text style={s.remove}>Remove</Text></TouchableOpacity></View>; })}<View style={s.totalRow}><Text style={s.totalLabel}>Total</Text><Text style={s.totalPrice}>{money(total)}</Text></View>{btn(role === 'Dealer' ? 'Submit Demo Bulk Order' : 'Proceed to Demo Checkout', () => setScreen('Checkout'))}</>}{btn('Continue Shopping', () => setScreen(role === 'Dealer' ? 'Catalog' : 'Home'), true)}</ScrollView>;
  const renderCheckout = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>{role === 'Dealer' ? 'Bulk Order Details' : 'Demo Checkout'}</Text><Text style={s.subtitle}>Demo only: no real payment, delivery or wholesale transaction.</Text><View style={s.formCard}><Text style={s.label}>{role === 'Dealer' ? 'Business / dealer name' : 'Customer name'}</Text><TextInput style={s.formInput} value={name} onChangeText={setName} placeholder="Enter name"/><Text style={s.label}>Phone number</Text><TextInput style={s.formInput} value={phone} onChangeText={setPhone} placeholder="10 digit phone number" keyboardType="phone-pad" maxLength={15}/><Text style={s.label}>Address</Text><TextInput style={[s.formInput, s.addressInput]} value={address} onChangeText={setAddress} placeholder="Enter sample address" multiline/><View style={s.totalRow}><Text style={s.totalLabel}>Order total</Text><Text style={s.totalPrice}>{money(total)}</Text></View>{btn('Place Demo Order', placeOrder)}</View></ScrollView>;
  const renderOrders = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>{role === 'Admin' ? 'All Orders' : 'Order History'}</Text><Text style={s.subtitle}>Your orders are synced with your account.</Text>{!orders.length ? <Text style={s.empty}>No demo orders yet.</Text> : orders.filter(o => role === 'Admin' || o.role === role).map(o => <View key={o.id} style={s.orderCard}><View style={s.orderHeader}><Text style={s.orderId}>{o.id}</Text><Text style={s.totalPrice}>{money(o.total)}</Text></View><Text style={s.meta}>{o.date} · {o.role}</Text><Text style={s.meta}>Name: {o.customerName} · Phone: {o.phone}</Text><Text style={s.meta}>Address: {o.address}</Text><Text style={s.meta}>Status: {o.status}</Text>{o.items.map(it => { const p = products.find(x => x.id === it.productId); return p ? <Text key={it.productId} style={s.feature}>• {p.name} × {it.quantity}</Text> : null; })}{role === 'Admin' && btn('Mark demo order processed', () => setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: 'Processed (demo)' } : x)), true)}</View>)}</ScrollView>;
  const renderService = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>{role === 'Admin' ? 'Service Desk' : 'Book a Service'}</Text>{role !== 'Admin' && <><Text style={s.subtitle}>Create a sample purifier service request.</Text><View style={s.formCard}><Text style={s.label}>Name</Text><TextInput style={s.formInput} value={name} onChangeText={setName} placeholder="Enter name"/><Text style={s.label}>Phone</Text><TextInput style={s.formInput} value={phone} onChangeText={setPhone} placeholder="10 digit phone" keyboardType="phone-pad"/><Text style={s.label}>Address</Text><TextInput style={s.formInput} value={address} onChangeText={setAddress} placeholder="Service address"/><Text style={s.label}>Issue / service needed</Text><TextInput style={[s.formInput, s.addressInput]} value={issue} onChangeText={setIssue} placeholder="e.g. filter replacement" multiline/>{btn('Submit Demo Service Request', bookService)}</View></>}{!services.length ? <Text style={s.empty}>No service requests yet.</Text> : services.map(sr => <View key={sr.id} style={s.orderCard}><Text style={s.orderId}>{sr.id}</Text><Text style={s.meta}>{sr.name} · {sr.phone}</Text><Text style={s.meta}>{sr.address}</Text><Text style={s.meta}>Issue: {sr.issue}</Text><Text style={s.meta}>Status: {sr.status}</Text>{role === 'Admin' && btn('Mark service in progress', () => setServices(prev => prev.map(x => x.id === sr.id ? { ...x, status: 'In progress (demo)' } : x)), true)}</View>)}</ScrollView>;
  const renderProfile = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>{role} Profile</Text><View style={s.formCard}><Text style={s.subtitle}>Demo profile screen</Text><Text style={s.meta}>Role: {role}</Text><Text style={s.meta}>Account login and verified role assignment will be connected with Firebase in a later step.</Text>{role === 'Dealer' && <><Text style={s.label}>Business name</Text><TextInput style={s.formInput} value={dealerName} onChangeText={setDealerName}/><Text style={s.meta}>Approval status: Pending (demo)</Text></>}{btn('Switch role / Sign out (demo)', resetRole, true)}</View></ScrollView>;
  const renderAdmin = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Admin Mobile Dashboard</Text><Text style={s.subtitle}>Demo admin tools. Secure web admin panel deployment is still required by the assignment.</Text><View style={s.statsRow}><View style={s.statCard}><Text style={s.statNumber}>{allProducts.length}</Text><Text style={s.statLabel}>Products</Text></View><View style={s.statCard}><Text style={s.statNumber}>{orders.length}</Text><Text style={s.statLabel}>Orders</Text></View><View style={s.statCard}><Text style={s.statNumber}>{services.length}</Text><Text style={s.statLabel}>Services</Text></View></View>{btn('Manage Products', () => setScreen('Products'))}{btn('View All Orders', () => setScreen('Orders'), true)}{btn('Dealer Applications', () => setScreen('Dealers'), true)}{btn('Service Desk', () => setScreen('Service'), true)}<View style={s.warning}><Text style={s.warningText}>Security note: role selection here is only for UI demonstration. Do not use this as real admin authentication. Firebase Auth and server-controlled roles are not connected yet.</Text></View></ScrollView>;
  const renderDealers = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Dealer Applications</Text><Text style={s.subtitle}>Sample dealer application screen. Real applications need to be stored in Firestore.</Text><View style={s.orderCard}><Text style={s.productName}>{dealerName}</Text><Text style={s.meta}>Status: Pending (demo)</Text>{btn('Approve (demo only)', () => Alert.alert('Demo only', 'This does not change any real account.'), true)}{btn('Reject (demo only)', () => Alert.alert('Demo only', 'This does not change any real account.'), true)}</View></ScrollView>;
  const renderProductsAdmin = () => <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Manage Products</Text><Text style={s.subtitle}>Read-only sample catalogue. Add/edit/delete will need a protected Firestore admin workflow.</Text>{products.map(p => <View key={p.id} style={s.adminProduct}><Image source={p.image} style={s.cartImage} resizeMode="contain"/><View style={s.cartInfo}><Text style={s.productName}>{p.name}</Text><Text style={s.price}>{money(p.price)}</Text><Text style={s.meta}>{p.category}</Text></View></View>)}</ScrollView>;
  if (authLoading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
   );
  }

  if (!authUser) {
    return <AuthScreen onLoginSuccess={() => {}} />;
  }
  return <SafeAreaView style={s.container}>{header}{!role ? <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Welcome to Califnco</Text><Text style={s.subtitle}>Choose your account role to continue.</Text>{(['Customer', 'Dealer', 'Admin'] as Role[])
  .filter(r => {
    if (r === 'Admin') return authUser?.uid === ADMIN_UID;
    if (r === 'Dealer') return true;
    return true;
  })
  .map(r => (
    <TouchableOpacity
      key={r}
      style={s.roleCard}
      onPress={() => {
        setRole(r);
        setScreen(r === 'Admin' ? 'Dashboard' : 'Home');
      }}
    >
      <Text style={s.roleTitle}>
        {r === 'Customer'
        ? '🛍️ Customer'
        : r === 'Dealer'
        ? '🏪 Dealer'
        : '🛡️ Admin'}
      </Text>
      <Text style={s.meta}>
        {r === 'Customer'
          ? 'Browse products, cart, checkout, service'
          : 'Overview, products, orders, dealers, service desk'}
      </Text>
    </TouchableOpacity>
  ))}<View style={s.warning}><Text style={s.warningText}>Important: this is a local demo role selector, not secure login. Do not use real customer data or real payments.</Text></View></ScrollView> : <><View style={s.nav}>{nav.map(tab => <TouchableOpacity key={tab} onPress={() => setScreen(tab)}><Text style={screen === tab ? s.activeTab : s.tab}>{tab}{tab === 'Cart' ? ` (${count})` : tab === 'Orders' ? ` (${role === 'Admin' ? orders.length : orders.filter(o => o.role === role).length})` : ''}</Text></TouchableOpacity>)}</View>{screen === 'Home' && renderCatalog()}{screen === 'Catalog' && renderCatalog()}{screen === 'Details' && selected && <ScrollView contentContainerStyle={s.content}><TouchableOpacity onPress={() => setScreen(role === 'Dealer' ? 'Catalog' : 'Home')}><Text style={s.back}>← Back to products</Text></TouchableOpacity><View style={s.detailsCard}><Image source={selected.image} style={s.detailsImage} resizeMode="contain"/><Text style={s.detailsName}>{selected.name}</Text><Text style={s.detailsPrice}>{money(priceFor(selected))}</Text><Text style={s.detailsCategory}>Category: {selected.category}</Text><Text style={s.description}>{selected.description}</Text>{btn('+ Add to Cart', () => add(selected.id))}</View></ScrollView>}{screen === 'Cart' && renderCart()}{screen === 'Checkout' && renderCheckout()}{screen === 'Orders' && renderOrders()}{screen === 'Service' && renderService()}{screen === 'Profile' && renderProfile()}{screen === 'Dashboard' && renderAdmin()}{screen === 'Products' && renderProductsAdmin()}{screen === 'Dealers' && renderDealers()}</>}</SafeAreaView>;
}
const s = StyleSheet.create({
 container:{flex:1,backgroundColor:'#F4F8FB'}, header:{backgroundColor:'#075985',padding:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, logo:{color:'#fff',fontSize:24,fontWeight:'bold'}, tagline:{color:'#D9F1FF',marginTop:3}, rolePill:{backgroundColor:'#fff',paddingHorizontal:12,paddingVertical:9,borderRadius:20},rolePillText:{color:'#075985',fontWeight:'bold'}, nav:{flexDirection:'row',justifyContent:'space-around',paddingVertical:14,paddingHorizontal:5,backgroundColor:'#fff',flexWrap:'wrap',gap:12}, tab:{color:'#64748B',fontWeight:'600',fontSize:13},activeTab:{color:'#075985',fontWeight:'bold',fontSize:13},content:{padding:16,paddingBottom:35},heading:{fontSize:25,fontWeight:'bold',color:'#0F172A'},subtitle:{color:'#64748B',marginTop:6,marginBottom:16,lineHeight:20},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#CBD5E1',borderRadius:12,padding:13,fontSize:16,marginVertical:14,color:'#0F172A'},section:{fontSize:18,fontWeight:'bold',color:'#0F172A',marginBottom:12,marginTop:8},categoryList:{marginBottom:12,flexGrow:0},categoryButton:{backgroundColor:'#E2E8F0',paddingHorizontal:18,paddingVertical:10,borderRadius:20,marginRight:8},selectedCategory:{backgroundColor:'#075985'},categoryText:{color:'#334155',fontWeight:'600'},selectedCategoryText:{color:'#fff'},card:{backgroundColor:'#fff',padding:16,borderRadius:14,marginBottom:14,borderWidth:1,borderColor:'#E2E8F0'},productInfo:{alignItems:'center'},productImage:{width:'100%',height:150,borderRadius:10,backgroundColor:'#F0F9FF',marginBottom:10},detailsImage:{width:'100%',height:230,borderRadius:12,backgroundColor:'#F0F9FF',marginVertical:15},productName:{color:'#0F172A',fontSize:16,fontWeight:'bold'},price:{color:'#075985',fontSize:18,fontWeight:'bold',marginTop:6},dealerHint:{color:'#047857',fontWeight:'600',marginTop:4},categoryLabel:{color:'#64748B',marginTop:5},detailsHint:{color:'#0284C7',marginTop:8},button:{backgroundColor:'#075985',padding:14,borderRadius:10,alignItems:'center',marginTop:14},buttonText:{color:'#fff',fontSize:15,fontWeight:'bold',textAlign:'center'},secondary:{backgroundColor:'#E0F2FE',padding:13,borderRadius:10,alignItems:'center',marginTop:12},secondaryText:{color:'#075985',fontWeight:'bold',fontSize:15},empty:{color:'#64748B',textAlign:'center',marginVertical:25,lineHeight:22},back:{color:'#0284C7',fontSize:16,marginBottom:16},detailsCard:{backgroundColor:'#fff',padding:20,borderRadius:16},detailsName:{fontSize:23,color:'#0F172A',fontWeight:'bold',textAlign:'center'},detailsPrice:{fontSize:25,color:'#075985',fontWeight:'bold',textAlign:'center',marginTop:12},detailsCategory:{textAlign:'center',color:'#64748B',marginTop:8},description:{color:'#334155',fontSize:16,lineHeight:24,marginTop:20},cartItem:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',padding:12,borderRadius:12,marginTop:10,gap:10},cartImage:{width:60,height:70,backgroundColor:'#F0F9FF',borderRadius:8},cartInfo:{flex:1},quantityRow:{flexDirection:'row',alignItems:'center',marginTop:9,gap:12},qtyButton:{backgroundColor:'#E0F2FE',width:32,height:32,borderRadius:8,alignItems:'center',justifyContent:'center'},qtyText:{color:'#075985',fontSize:20,fontWeight:'bold'},quantity:{color:'#0F172A',fontWeight:'bold',minWidth:16,textAlign:'center'},remove:{color:'#DC2626',fontWeight:'bold',marginLeft:4},totalRow:{flexDirection:'row',justifyContent:'space-between',marginTop:22,padding:14,backgroundColor:'#DBEAFE',borderRadius:10},totalLabel:{fontSize:18,fontWeight:'bold',color:'#0F172A'},totalPrice:{fontSize:18,fontWeight:'bold',color:'#075985'},formCard:{backgroundColor:'#fff',padding:16,borderRadius:14,marginTop:10},label:{color:'#334155',fontWeight:'bold',marginTop:12,marginBottom:6},formInput:{backgroundColor:'#F8FAFC',borderWidth:1,borderColor:'#CBD5E1',borderRadius:10,padding:12,fontSize:16,color:'#0F172A'},addressInput:{minHeight:80,textAlignVertical:'top'},orderCard:{backgroundColor:'#fff',padding:16,borderRadius:14,marginTop:14,borderWidth:1,borderColor:'#E2E8F0'},orderHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},orderId:{color:'#075985',fontWeight:'bold',fontSize:16},meta:{color:'#475569',marginTop:6,lineHeight:20},roleCard:{backgroundColor:'#fff',padding:18,borderRadius:14,marginTop:12,borderWidth:1,borderColor:'#CBD5E1'},roleTitle:{fontSize:19,fontWeight:'bold',color:'#075985',marginBottom:8},warning:{backgroundColor:'#FEF3C7',padding:12,borderRadius:10,marginTop:16},warningText:{color:'#92400E',lineHeight:20,fontSize:13},statsRow:{flexDirection:'row',gap:8,marginVertical:12},statCard:{flex:1,backgroundColor:'#fff',padding:12,borderRadius:12,alignItems:'center'},statNumber:{fontSize:22,fontWeight:'bold',color:'#075985'},statLabel:{color:'#64748B',fontSize:12,marginTop:4},adminProduct:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',padding:10,borderRadius:10,marginTop:8}
});
