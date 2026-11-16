// The same global styles Stars loads in src/routes/+layout.svelte.
import '$ui/tokens/index.css';
import '$ui/styles/reset.css';
import '$ui/styles/base.css';
import '$ui/styles/utilities.css';
import { mount } from 'svelte';
import App from './App.svelte';

export default mount(App, { target: document.getElementById('app') });
