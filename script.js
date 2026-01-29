// --- State Management ---
let menuItems = [];
let orders = [];
let cart = [];
let currentView = 'menu';
let selectedCategory = 'All';
let searchQuery = '';
let adminMode = false;

const categories = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages'];

// --- LocalStorage Helpers ---
const storage = {
    save: (key, data) => localStorage.setItem(`canteen_${key}`, JSON.stringify(data)),
    get: (key) => JSON.parse(localStorage.getItem(`canteen_${key}`))
};

// --- Initialization ---
function initApp() {
    const savedMenu = storage.get('menu');
    if (savedMenu && savedMenu.length > 0) {
        menuItems = savedMenu;
    } else {
        menuItems = [
            { id: '1', name: 'Veg Sandwich', price: 45, category: 'Breakfast', available: true, image: '🥪' },
            { id: '2', name: 'Chicken Biryani', price: 120, category: 'Lunch', available: true, image: '🥘' },
            { id: '3', name: 'Coffee', price: 20, category: 'Beverages', available: true, image: '☕' },
            { id: '4', name: 'Samosa', price: 15, category: 'Snacks', available: true, image: '🥟' }
        ];
        storage.save('menu', menuItems);
    }
    orders = storage.get('orders') || [];
    render();
}

// --- Actions ---
window.handleSearch = (e) => {
    searchQuery = e.target.value.toLowerCase();
    render();
};

window.addToCart = (itemId) => {
    const item = menuItems.find(i => i.id === itemId);
    const cartItem = cart.find(i => i.id === itemId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    showMessage(`${item.name} added to cart!`);
    render();
};

window.updateCartQuantity = (itemId, delta) => {
    const index = cart.findIndex(i => i.id === itemId);
    if (index !== -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    }
    render();
};

window.placeOrder = () => {
    if (cart.length === 0) return;
    
    // Add 5% Tax calculation to order history
    const subTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const finalTotal = Math.round(subTotal * 1.05);

    const newOrder = {
        id: Date.now().toString(),
        items: [...cart],
        total: finalTotal,
        status: 'Preparing',
        timestamp: new Date().toISOString(),
        orderNumber: Math.floor(1000 + Math.random() * 9000)
    };
    orders.unshift(newOrder);
    storage.save('orders', orders);
    cart = [];
    currentView = 'orders';
    
    // Trigger effects
    confettiEffect();
    showMessage("Order placed successfully!", "success");
    render();
};

window.updateOrderStatus = (orderId, newStatus) => {
    orders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    storage.save('orders', orders);
    showMessage(`Order marked as ${newStatus}`);
    render();
};

window.toggleAvailability = (itemId, current) => {
    menuItems = menuItems.map(i => i.id === itemId ? { ...i, available: !current } : i);
    storage.save('menu', menuItems);
    render();
};

window.deleteItem = (itemId) => {
    if (!confirm("Remove this item from menu?")) return;
    menuItems = menuItems.filter(i => i.id !== itemId);
    storage.save('menu', menuItems);
    showMessage("Item deleted");
    render();
};

window.addNewItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
        id: Date.now().toString(),
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        available: true,
        image: formData.get('emoji') || '🍴'
    };
    menuItems.push(newItem);
    storage.save('menu', menuItems);
    e.target.reset();
    showMessage("Item added to menu", "success");
    render();
};

window.setView = (view) => {
    currentView = view;
    render();
};

window.setCategory = (cat) => {
    selectedCategory = cat;
    render();
};

window.toggleAdmin = () => {
    adminMode = !adminMode;
    currentView = adminMode ? 'admin' : 'menu';
    render();
};

function showMessage(text, type = 'info') {
    const container = document.getElementById('message-container');
    if(!container) return;
    const msg = document.createElement('div');
    const colorClass = type === 'error' ? 'bg-red-500 text-white' : type === 'success' ? 'bg-green-500 text-white' : 'bg-white text-gray-800';
    
    msg.className = `p-4 mb-2 rounded-2xl shadow-xl transform transition-all duration-300 slide-up border border-white/20 ${colorClass}`;
    msg.innerText = text;
    container.appendChild(msg);
    setTimeout(() => {
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(-10px)';
        setTimeout(() => msg.remove(), 500);
    }, 3000);
}

// --- Visual Effects ---
function confettiEffect() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    for(let i=0; i<50; i++) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.left = Math.random() * 100 + 'vw';
        div.style.top = '-10px';
        div.style.width = '10px';
        div.style.height = '10px';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.transition = 'top 2s ease-out, transform 2s linear';
        div.style.zIndex = '9999';
        div.style.borderRadius = '50%';
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.style.top = '110vh';
            div.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 10);
        
        setTimeout(() => div.remove(), 2000);
    }
}

// --- UI Rendering ---
function render() {
    const appDiv = document.getElementById('app');
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    appDiv.innerHTML = `
        <div id="message-container" class="fixed top-4 right-4 z-50 flex flex-col items-end"></div>

        <nav class="glass-nav sticky top-0 z-40 transition-all duration-300">
            <div class="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                <div class="flex items-center space-x-3 cursor-pointer" onclick="setView('menu')">
                    <span class="text-3xl filter drop-shadow-md">🍱</span>
                    <h1 class="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">SmartCanteen</h1>
                </div>
                
                <div class="flex items-center space-x-6">
                    ${!adminMode ? `
                        <button onclick="setView('menu')" class="transition-colors ${currentView === 'menu' ? 'text-black font-bold' : 'text-gray-500 hover:text-black'}">
                            Menu
                        </button>
                        <button onclick="setView('orders')" class="transition-colors ${currentView === 'orders' ? 'text-black font-bold' : 'text-gray-500 hover:text-black'}">
                            Orders
                        </button>
                        <button onclick="setView('cart')" class="relative p-2 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-width="2"/></svg>
                            ${cartCount > 0 ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">${cartCount}</span>` : ''}
                        </button>
                    ` : ''}
                    <button onclick="toggleAdmin()" class="text-sm font-medium ${adminMode ? 'bg-red-500 text-white shadow-lg' : 'bg-white/50 text-gray-600 hover:bg-white'} px-4 py-2 rounded-full transition-all">
                        ${adminMode ? 'Exit Admin' : 'Admin'}
                    </button>
                </div>
            </div>
        </nav>

        <main class="max-w-5xl mx-auto p-6 pb-20">
            ${renderContent()}
        </main>
    `;
}

function renderContent() {
    if (adminMode) return renderAdmin();
    switch(currentView) {
        case 'menu': return renderMenu();
        case 'cart': return renderCart();
        case 'orders': return renderOrderHistory();
        default: return renderMenu();
    }
}

function renderMenu() {
    // Smart Logic: Bestsellers & Greeting
    const allOrderItems = orders.flatMap(o => o.items);
    const itemCounts = {};
    allOrderItems.forEach(i => itemCounts[i.id] = (itemCounts[i.id] || 0) + i.quantity);
    const bestSellerId = Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b, null);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning ☀️" : hour < 18 ? "Good Afternoon 🌤️" : "Good Evening 🌙";

    const filteredItems = menuItems.filter(i => {
        const matchesCategory = selectedCategory === 'All' || i.category === selectedCategory;
        const matchesSearch = i.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    return `
        <div class="glass-panel rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center slide-up">
            <div class="mb-4 md:mb-0">
                <h2 class="text-4xl font-bold text-gray-800 mb-2">${greeting}</h2>
                <p class="text-gray-500 text-lg">What are you craving today?</p>
            </div>
            <div class="relative w-full md:w-auto">
                <span class="absolute left-4 top-3.5 text-gray-400">🔍</span>
                <input type="text" 
                    placeholder="Search menu..." 
                    oninput="handleSearch(event)"
                    value="${searchQuery}"
                    class="w-full md:w-80 pl-12 pr-6 py-3 rounded-full bg-white/50 border border-white focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all shadow-inner">
            </div>
        </div>

        <div class="mb-8 overflow-x-auto hide-scrollbar flex space-x-3 py-2">
            ${categories.map((cat, idx) => `
                <button onclick="setCategory('${cat}')" 
                    class="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 slide-up
                    ${selectedCategory === cat ? 'bg-black text-white shadow-xl scale-105' : 'glass text-gray-700 hover:bg-white hover:scale-105'}"
                    style="animation-delay: ${idx * 50}ms">
                    ${cat}
                </button>
            `).join('')}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${filteredItems.length > 0 ? filteredItems.map((item, index) => `
                <div class="glass rounded-3xl p-4 flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 slide-up" style="animation-delay: ${index * 50}ms">
                    <div class="relative mb-4 bg-white/40 h-40 rounded-2xl flex items-center justify-center text-6xl shadow-inner group-hover:scale-[1.02] transition-transform">
                        ${item.image}
                        ${item.id === bestSellerId ? `<span class="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">⭐ BESTSELLER</span>` : ''}
                    </div>
                    
                    <div class="px-1">
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">${item.category}</p>
                        <h3 class="font-bold text-gray-800 text-lg leading-tight mb-4">${item.name}</h3>
                        
                        <div class="mt-auto flex items-center justify-between">
                            <span class="font-bold text-xl text-gray-900">₹${item.price}</span>
                            ${item.available 
                                ? `<button onclick="addToCart('${item.id}')" class="btn-bounce bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                   </button>` 
                                : `<span class="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-md">Sold Out</span>`}
                        </div>
                    </div>
                </div>
            `).join('') : `<div class="col-span-full text-center py-20 glass rounded-3xl text-gray-500">No items found. Try a different category!</div>`}
        </div>`;
}

function renderCart() {
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = Math.round(total * 0.05);
    const finalTotal = total + tax;

    if (cart.length === 0) return `
        <div class="flex flex-col items-center justify-center py-20 glass-panel rounded-3xl text-center slide-up">
            <div class="text-6xl mb-6 opacity-80">🍽️</div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Your plate is empty</h2>
            <p class="text-gray-500 mb-8">Go add some delicious items from the menu!</p>
            <button onclick="setView('menu')" class="bg-black text-white px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">Browse Menu</button>
        </div>`;
        
    return `
        <div class="max-w-2xl mx-auto glass-panel rounded-3xl p-8 shadow-2xl slide-up">
            <div class="flex justify-between items-center mb-8 border-b border-gray-200/50 pb-6">
                <h2 class="text-2xl font-bold">Current Order</h2>
                <span class="bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium">${cart.reduce((s,i)=>s+i.quantity,0)} Items</span>
            </div>
            
            <div class="space-y-4 mb-8">
                ${cart.map(item => `
                    <div class="flex items-center justify-between p-3 hover:bg-white/40 rounded-2xl transition-colors group">
                        <div class="flex items-center space-x-4">
                            <div class="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">${item.image}</div>
                            <div>
                                <h4 class="font-bold text-gray-800">${item.name}</h4>
                                <p class="text-sm text-gray-500">₹${item.price} x ${item.quantity}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3 bg-white/80 rounded-full px-2 py-1 shadow-sm border border-gray-100">
                            <button onclick="updateCartQuantity('${item.id}', -1)" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-500 font-bold transition-colors">-</button>
                            <span class="font-bold text-sm w-4 text-center">${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.id}', 1)" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-green-500 font-bold transition-colors">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="bg-white/50 rounded-2xl p-6 space-y-3 mb-8 border border-white">
                <div class="flex justify-between text-gray-600"><span>Subtotal</span><span>₹${total}</span></div>
                <div class="flex justify-between text-gray-600"><span>Tax (5%)</span><span>₹${tax}</span></div>
                <div class="h-px bg-gray-300 my-2"></div>
                <div class="flex justify-between text-2xl font-bold text-gray-900"><span>Total</span><span>₹${finalTotal}</span></div>
            </div>
            
            <button onclick="placeOrder()" class="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-95 flex justify-center items-center group">
                <span>Confirm Order</span>
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
        </div>`;
}

function renderOrderHistory() {
    if (orders.length === 0) return `<div class="text-center py-20 text-white/80 font-medium text-xl slide-up">No past orders found.</div>`;
    return `
        <h2 class="text-3xl font-bold mb-8 text-white drop-shadow-md">Your Orders</h2>
        <div class="space-y-6">
            ${orders.map((order, index) => `
                <div class="glass-panel p-6 rounded-3xl slide-up hover:scale-[1.01] transition-transform" style="animation-delay: ${index * 100}ms">
                    <div class="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} flex items-center justify-center text-xl">
                                ${order.status === 'Completed' ? '✓' : '⏳'}
                            </div>
                            <div>
                                <h3 class="font-bold text-lg">Order #${order.orderNumber}</h3>
                                <p class="text-sm text-gray-500">${new Date(order.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                        <span class="self-start md:self-center px-4 py-2 rounded-full text-sm font-bold ${order.status === 'Completed' ? 'bg-green-500 text-white shadow-green-200' : 'bg-orange-400 text-white shadow-orange-200'} shadow-lg">
                            ${order.status}
                        </span>
                    </div>
                    <div class="bg-white/40 rounded-xl p-4 mb-4">
                        ${order.items.map(i => `<div class="flex justify-between py-1 border-b last:border-0 border-gray-100">
                            <span class="text-gray-700 font-medium">${i.quantity}x ${i.name}</span>
                            <span class="text-gray-500">₹${i.price * i.quantity}</span>
                        </div>`).join('')}
                    </div>
                    <div class="flex justify-end items-center gap-2">
                        <span class="text-gray-500 text-sm">Total Paid</span>
                        <span class="text-2xl font-bold text-gray-800">₹${order.total}</span>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

function renderAdmin() {
    const activeOrders = orders.filter(o => o.status !== 'Completed');
    return `
        <div class="flex justify-between items-center mb-8 slide-up">
            <h2 class="text-3xl font-bold text-white drop-shadow-md">Admin Dashboard</h2>
            <button onclick="if(confirm('Clear all orders?')){orders=[]; storage.save('orders',[]); render();}" class="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-md transition-colors">Clear History</button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 slide-up">
            <div class="glass-panel p-6 rounded-3xl">
                <p class="text-gray-500 text-sm font-bold uppercase tracking-wider">Revenue</p>
                <span class="text-4xl font-bold text-gray-800">₹${orders.reduce((s, o) => s + o.total, 0)}</span>
            </div>
            <div class="glass-panel p-6 rounded-3xl">
                <p class="text-gray-500 text-sm font-bold uppercase tracking-wider">Pending</p>
                <span class="text-4xl font-bold text-orange-500">${activeOrders.length}</span>
            </div>
            <div class="glass-panel p-6 rounded-3xl">
                <p class="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Items</p>
                <span class="text-4xl font-bold text-blue-500">${menuItems.length}</span>
            </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-8 slide-up" style="animation-delay: 200ms">
            <div class="flex-1">
                <h3 class="font-bold text-xl text-white mb-4 flex items-center drop-shadow-sm">
                    <span class="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3"></span>
                    Live Orders
                </h3>
                <div class="space-y-4">
                    ${activeOrders.length > 0 ? activeOrders.map(order => `
                        <div class="glass-panel p-5 rounded-2xl border-l-4 ${order.status === 'Ready' ? 'border-green-500' : 'border-orange-500'}">
                            <div class="flex justify-between font-bold mb-3">
                                <span class="text-lg">#${order.orderNumber}</span>
                                <span class="text-xs px-2 py-1 rounded bg-gray-900 text-white">${order.status}</span>
                            </div>
                            <div class="text-sm text-gray-600 mb-4 bg-white/50 p-3 rounded-lg">
                                ${order.items.map(i => `<div class="flex justify-between mb-1"><span>${i.quantity}x ${i.name}</span><span class="font-mono">₹${i.price * i.quantity}</span></div>`).join('')}
                                <div class="border-t border-gray-200 mt-2 pt-1 flex justify-between font-bold"><span>Total</span><span>₹${order.total}</span></div>
                            </div>
                            <button onclick="updateOrderStatus('${order.id}', '${order.status === 'Preparing' ? 'Ready' : 'Completed'}')" 
                                class="w-full ${order.status === 'Preparing' ? 'bg-black hover:bg-gray-800' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                                ${order.status === 'Preparing' ? 'Mark Ready to Serve' : 'Complete Order'}
                            </button>
                        </div>
                    `).join('') : `<div class="glass-panel p-8 rounded-2xl text-center text-gray-400 italic">No active orders right now.</div>`}
                </div>
            </div>

            <div class="lg:w-96 space-y-6">
                <div class="glass-panel p-6 rounded-3xl">
                    <h3 class="font-bold mb-4 text-lg">Add New Item</h3>
                    <form onsubmit="addNewItem(event)" class="space-y-3">
                        <input type="text" name="name" placeholder="Item Name" required class="w-full bg-white/50 border border-gray-200 p-3 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all">
                        <div class="flex gap-3">
                            <input type="number" name="price" placeholder="Price ₹" required class="w-1/2 bg-white/50 border border-gray-200 p-3 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black">
                            <input type="text" name="emoji" placeholder="Emoji" class="w-1/2 bg-white/50 border border-gray-200 p-3 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black">
                        </div>
                        <select name="category" class="w-full bg-white/50 border border-gray-200 p-3 rounded-xl outline-none focus:bg-white">
                            ${categories.filter(c => c !== 'All').map(c => `<option>${c}</option>`).join('')}
                        </select>
                        <button class="w-full bg-black text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg">Add to Menu</button>
                    </form>
                </div>
                
                <div class="glass-panel p-6 rounded-3xl">
                    <h3 class="font-bold mb-4 text-lg">Quick Inventory</h3>
                    <div class="divide-y divide-gray-200/50 max-h-60 overflow-y-auto pr-2 custom-scroll">
                        ${menuItems.map(item => `
                            <div class="py-3 flex items-center justify-between group">
                                <span class="${item.available ? 'text-gray-800' : 'line-through text-gray-400'} font-medium">${item.image} ${item.name}</span>
                                <div class="flex space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button onclick="toggleAvailability('${item.id}', ${item.available})" class="w-8 h-8 rounded-lg flex items-center justify-center ${item.available ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">
                                        ${item.available ? '✕' : '✓'}
                                    </button>
                                    <button onclick="deleteItem('${item.id}')" class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>`;
}

// Attach event listener
window.addEventListener('DOMContentLoaded', initApp);