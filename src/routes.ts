import state from './state'

import * as Router from 'vue-router'

import Arpeggios    from './views/Arpeggios.vue'
import Scales       from './views/Scales.vue'
import Settings     from './views/Settings.vue'
import Notes        from './views/Notes.vue'
import NotePractice from './views/Practice.vue'

const router = Router.createRouter({
	history: Router.createWebHashHistory(),
	routes: [
		{ path: "/arpeggios", component: Arpeggios },
		{ path: "/scales", component: Scales },
		{ path: "/settings", component: Settings },
		{ path: "/notes", component: Notes },
		{ path: "/practice", component: NotePractice }
	],
})

// Save route in state
router.addRoute({ path: "/", redirect: state.lastPath })
router.afterEach((x) => state.lastPath = x.path)

export default router;
