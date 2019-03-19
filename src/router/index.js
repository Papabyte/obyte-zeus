import Vue from 'vue'
import Router from 'vue-router'
import lazyLoading from './lazyLoading'

Vue.use(Router)

export default new Router({
	routes: [
		{
			name: 'configure',
			path: '/',
			component: lazyLoading('Configure'),
			default: true

		},
		{
			name: 'loadmasterkey',
			path: '/loadmasterkey',
			component: lazyLoading('LoadMasterKey'),
			props: true
		},
		{
			name: 'createmasterkey',
			path: '/createmasterkey',
			component: lazyLoading('CreateMasterKey'),
			props: true
		},
		{
			name: 'download_prod_key_and_change_definition',
			path: '/download_prod_key_and_change_definition',
			component: lazyLoading('DownloadProdKeyAndChangeDefinition'),
			props: true
		}

	],
})
