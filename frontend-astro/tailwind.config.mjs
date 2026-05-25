/** @type {import('tailwindcss').Config} */
/** Minimalista amarillo - paleta personalizada */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#072A4A', // Azul marino profesional
					light: '#0B4F6C',
					dark: '#041826',
				},
				accent: {
					DEFAULT: '#FF6B57', // Coral/acento cálido
					muted: '#FFD6CF',
				},
				amarillo: {
					DEFAULT: '#D88600', // Amarillo / dorado principal más cálido
					claro: '#F8E9C9',   // Fondo crema claro
					medio: '#F2D28F',   // Dorado medio para gradientes
					dorado: '#E0A400',  // Dorado intenso para acentos
					oscuro: '#B56A00',  // Tonalidad más oscura para hover
				},
				fondo: {
					crema: '#F9F1E3',  // Color base página
					crema2: '#F4E3CC',
				},
				gris: {
					claro: '#F5F5F5',  // Fondo neutro
					medio: '#E0E0E0',
					oscuro: '#9E9E9E',
				},
				negro: '#222',
				blanco: '#fff',
			},
			fontFamily: {
				sans: ['Inter', 'Arial', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
