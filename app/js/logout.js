import {verificarSesion, configurarLogout } from './auth.js';

await verificarSesion();

configurarLogout();