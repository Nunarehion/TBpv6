import { e as error } from './index-VRy5eTKY.js';
import mongoose from 'mongoose';

async function load({ fetch }) {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    return {
      collections: collectionNames
    };
  } catch (e) {
    console.error("Error in +page.server.js load function:", e);
    throw error(500, "Failed to load collections. Internal server error.");
  }
}

var _page_server = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-ByOgDSjJ.js')).default;
const server_id = "src/routes/all/+page.server.js";
const imports = ["_app/immutable/nodes/5.BJo6JW1B.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/69_IOA4Y.js","_app/immutable/chunks/DIeogL5L.js","_app/immutable/chunks/bhRhCqWC.js","_app/immutable/chunks/CnxLOvM0.js","_app/immutable/chunks/BFpeZ14H.js","_app/immutable/chunks/DulKp6NI.js","_app/immutable/chunks/5VKP8Fpw.js","_app/immutable/chunks/C-D-gK8t.js","_app/immutable/chunks/h1hal1Ui.js","_app/immutable/chunks/DVubXfnJ.js","_app/immutable/chunks/m49QtOYO.js","_app/immutable/chunks/CNL2E_I9.js","_app/immutable/chunks/BV2Y1Hvn.js","_app/immutable/chunks/Bfc47y5P.js"];
const stylesheets = ["_app/immutable/assets/5.BTKZG0vG.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=5-CqBKW1e2.js.map
