const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["sprite.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.BFDQkBGn.js",app:"_app/immutable/entry/app.BW0f0riS.js",imports:["_app/immutable/entry/start.BFDQkBGn.js","_app/immutable/chunks/P5GLh8mW.js","_app/immutable/chunks/bhRhCqWC.js","_app/immutable/chunks/CnxLOvM0.js","_app/immutable/chunks/DIeogL5L.js","_app/immutable/chunks/BFpeZ14H.js","_app/immutable/chunks/5VKP8Fpw.js","_app/immutable/entry/app.BW0f0riS.js","_app/immutable/chunks/CnxLOvM0.js","_app/immutable/chunks/DIeogL5L.js","_app/immutable/chunks/BFpeZ14H.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/bhRhCqWC.js","_app/immutable/chunks/DulKp6NI.js","_app/immutable/chunks/5VKP8Fpw.js","_app/immutable/chunks/CFJY2ZC6.js","_app/immutable/chunks/h1hal1Ui.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-DBS0UKG4.js')),
			__memo(() => import('./chunks/1-CVzIdlcT.js')),
			__memo(() => import('./chunks/3-CME8ky8y.js')),
			__memo(() => import('./chunks/4-DAfvDx6U.js')),
			__memo(() => import('./chunks/5-CqBKW1e2.js')),
			__memo(() => import('./chunks/6-BMLS1YPY.js')),
			__memo(() => import('./chunks/7-BfnhKVy8.js')),
			__memo(() => import('./chunks/8-CKXeIR0e.js')),
			__memo(() => import('./chunks/9-Duf_QHhl.js')),
			__memo(() => import('./chunks/10-MAOmA-w7.js')),
			__memo(() => import('./chunks/11-DouU-JSd.js')),
			__memo(() => import('./chunks/12-aaYlANre.js')),
			__memo(() => import('./chunks/13-DZLsCgrK.js')),
			__memo(() => import('./chunks/14-CM-wSm3j.js')),
			__memo(() => import('./chunks/15-CH9_5Mei.js')),
			__memo(() => import('./chunks/16-Dp_WylXx.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/all",
				pattern: /^\/all\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/api/broadcast",
				pattern: /^\/api\/broadcast\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-2sQG2zcf.js'))
			},
			{
				id: "/api/collections",
				pattern: /^\/api\/collections\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-DI4z0Hp6.js'))
			},
			{
				id: "/api/images",
				pattern: /^\/api\/images\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BI8i_4Dz.js'))
			},
			{
				id: "/api/images/rename",
				pattern: /^\/api\/images\/rename\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-B7Rsc2kX.js'))
			},
			{
				id: "/api/images/[filename]",
				pattern: /^\/api\/images\/([^/]+?)\/?$/,
				params: [{"name":"filename","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-B7itQMuD.js'))
			},
			{
				id: "/api/statistics/clicks/by-pattern",
				pattern: /^\/api\/statistics\/clicks\/by-pattern\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-D2fqbZ-9.js'))
			},
			{
				id: "/api/statistics/clicks/time-series",
				pattern: /^\/api\/statistics\/clicks\/time-series\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-CoUbpT-y.js'))
			},
			{
				id: "/api/statistics/clicks/total",
				pattern: /^\/api\/statistics\/clicks\/total\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-q0kzRHr0.js'))
			},
			{
				id: "/api/statistics/users/active-over-time",
				pattern: /^\/api\/statistics\/users\/active-over-time\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-CTBmrZ-6.js'))
			},
			{
				id: "/api/statistics/users/most-active",
				pattern: /^\/api\/statistics\/users\/most-active\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-DdAp6DC9.js'))
			},
			{
				id: "/api/statistics/users/new-over-time",
				pattern: /^\/api\/statistics\/users\/new-over-time\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-BICiN7CA.js'))
			},
			{
				id: "/api/statistics/users/total",
				pattern: /^\/api\/statistics\/users\/total\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-DYpevfGK.js'))
			},
			{
				id: "/api/[collectionName]",
				pattern: /^\/api\/([^/]+?)\/?$/,
				params: [{"name":"collectionName","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-B76aRL7Z.js'))
			},
			{
				id: "/api/[collectionName]/[id]",
				pattern: /^\/api\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"collectionName","optional":false,"rest":false,"chained":false},{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-CmCXcxK2.js'))
			},
			{
				id: "/buttons",
				pattern: /^\/buttons\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/handlers",
				pattern: /^\/handlers\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/icones",
				pattern: /^\/icones\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/images",
				pattern: /^\/images\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/keyboards",
				pattern: /^\/keyboards\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/messages",
				pattern: /^\/messages\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/newsletter",
				pattern: /^\/newsletter\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/statistic/trigers",
				pattern: /^\/statistic\/trigers\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/statistic/users",
				pattern: /^\/statistic\/users\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/uploads/[filename]",
				pattern: /^\/uploads\/([^/]+?)\/?$/,
				params: [{"name":"filename","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Bci6N34v.js'))
			},
			{
				id: "/users",
				pattern: /^\/users\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/variables",
				pattern: /^\/variables\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
