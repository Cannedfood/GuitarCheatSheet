if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/pwa.js');
}

import Vue from 'vue'
import App from './components/App.vue'

let app = new Vue(App)
app.$mount("#app")

