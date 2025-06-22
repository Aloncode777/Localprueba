document.addEventListener('DOMContentLoaded', function() {
    // Carrito de compras
    const cart = {
      items: [],
      
      addItem: function(productId, name, price, quantity) {
        // Validar cantidad
        if (quantity <= 0) {
          showNotification('⛔ Selecciona al menos 1 unidad');
          return;
        }
        
        // Buscar si el producto ya está en el carrito
        const existingItemIndex = this.items.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
          // Actualizar cantidad si ya existe
          this.items[existingItemIndex].quantity += quantity;
        } else {
          // Agregar nuevo item
          this.items.push({
            id: productId,
            name: name,
            price: parseFloat(price),
            quantity: quantity
          });
        }
        
        this.updateCart();
        showNotification(`✔ ${quantity} ${name} añadido(s) al carrito`);
      },
      
      removeItem: function(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.updateCart();
        showNotification('🗑️ Producto eliminado del carrito');
      },
      
      calculateTotal: function() {
        return this.items.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
      },
      
      updateCart: function() {
        const cartItemsElement = document.getElementById('cart-items');
        const emptyMsgElement = document.getElementById('empty-cart-message');
        const checkoutBtnElement = document.getElementById('checkout-button');
        const cartCountElement = document.getElementById('cart-count');
        
        // Actualizar items del carrito
        if (this.items.length > 0) {
          cartItemsElement.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
              <span class="item-name">${item.name}</span>
              <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
              <button class="remove-item">
                <i class="fas fa-trash"></i>
              </button>
              <span class="item-quantity">${item.quantity} unidad(es)</span>
            </div>
          `).join('');
          
          cartItemsElement.style.display = 'block';
          emptyMsgElement.style.display = 'none';
          checkoutBtnElement.style.display = 'block';
        } else {
          cartItemsElement.style.display = 'none';
          emptyMsgElement.style.display = 'block';
          checkoutBtnElement.style.display = 'none';
        }
        
        // Actualizar totales
        const total = this.calculateTotal();
        document.getElementById('cart-subtotal').textContent = `$${total.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
        
        // Actualizar contador
        const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = itemCount;
        cartCountElement.style.display = itemCount > 0 ? 'flex' : 'none';
      }
    };
    
    // Event listeners para los botones de cantidad
    document.querySelectorAll('.quantity-btn').forEach(button => {
      button.addEventListener('click', function() {
        const parent = this.closest('.quantity-control');
        const quantityElement = parent.querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent);
        
        if (this.classList.contains('minus')) {
          quantity = quantity > 0 ? quantity - 1 : 0;
        } else {
          quantity += 1;
        }
        
        quantityElement.textContent = quantity;
      });
    });
    
    // Event listeners para añadir al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const productName = this.getAttribute('data-name');
        const productPrice = this.getAttribute('data-price');
        const quantity = parseInt(this.closest('.product-info').querySelector('.quantity').textContent);
        
        cart.addItem(productId, productName, productPrice, quantity);
        
        // Resetear contador
        this.closest('.product-info').querySelector('.quantity').textContent = '0';
      });
    });
    
    // Event listener para eliminar items del carrito
    document.getElementById('cart-items').addEventListener('click', function(e) {
      if (e.target.closest('.remove-item')) {
        const itemElement = e.target.closest('.cart-item');
        const productId = itemElement.getAttribute('data-id');
        cart.removeItem(productId);
      }
    });
    
    // Event listeners para el carrito
    document.getElementById('cart-button').addEventListener('click', function() {
      document.getElementById('cart-sidebar').style.transform = 'translateX(0)';
    });
    
    document.getElementById('close-cart').addEventListener('click', function() {
      document.getElementById('cart-sidebar').style.transform = 'translateX(100%)';
    });
    
    // Finalizar compra
    document.getElementById('checkout-button').addEventListener('click', function() {
      if (cart.items.length === 0) {
        showNotification('🛒 Tu carrito está vacío');
        return;
      }
      
      // Crear mensaje para WhatsApp
      let message = `*Nuevo Pedido - Aceites Motor Premium*`;
      message += `\n *Productos:*`;
      
      cart.items.forEach(item => {
        message += `\n ➡ ${item.name} `;
        message += `*Cantidad:* ${item.quantity} `;
        message += `*Precio:* $${item.price.toFixed(2)} `;
        message += `*Subtotal:* $${(item.price * item.quantity).toFixed(2)} `;
      });
      
      message += `\n *Total del pedido:* $${cart.calculateTotal().toFixed(2)}`;
      message += `\n *Datos del cliente:*`;
      
      // Solicitar datos del cliente
      const customerName = prompt("Por favor ingrese su nombre completo:");
      if (customerName) message += `\n👤 *Nombre:* ${customerName}`;
      
      const customerPhone = prompt("Por favor ingrese su número de teléfono:");
      if (customerPhone) message += `📱 *Teléfono:* ${customerPhone}`;
      
      const deliveryAddress = prompt("Por favor ingrese su dirección para entrega:");
      if (deliveryAddress) message += `🏠 *Dirección:* ${deliveryAddress}`;
      
      // NOTA IMPORTANTE: Reemplaza este número con TU número de WhatsApp
      // Formato: CódigoDePaís + Número (sin + ni espacios)
      // Ejemplo para Argentina: 5491122334455
      const whatsappNumber = "584247511271"; 
      
      // Abrir WhatsApp con el mensaje
      window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`, '_blank');
      
      // Vaciar carrito después de enviar
      cart.items = [];
      cart.updateCart();
      document.getElementById('cart-sidebar').style.transform = 'translateX(100%)';
      
      showNotification('✅ Pedido enviado con éxito');
    });
    
    // Función para mostrar notificaciones
    function showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
});
