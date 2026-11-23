import test from 'node:test';
import assert from 'node:assert/strict';
import { paginarLista, paginasVisibles } from '../src/utils/paginacion.js';

test('200 medicamentos se dividen en 20 páginas de 10', () => {
  const registros = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }));
  const p1 = paginarLista(registros, 1, 10);
  const p20 = paginarLista(registros, 20, 10);
  assert.equal(p1.totalPaginas, 20);
  assert.equal(p1.items.length, 10);
  assert.equal(p20.items[0].id, 191);
  assert.equal(p20.fin, 200);
});
test('se limita la página fuera del rango al último grupo', () => {
  const p = paginarLista(Array.from({length: 22}, (_,i)=>i), 999, 10);
  assert.equal(p.paginaActual, 3);
  assert.deepEqual(p.items, [20,21]);
});
test('sin resultados no muestra un rango falso', () => {
  const p = paginarLista([], 10, 12);
  assert.equal(p.inicio, 0);
  assert.equal(p.fin, 0);
  assert.equal(p.paginaActual, 1);
  assert.equal(p.totalPaginas, 1);
});
test('controles de páginas largas muestran primera, actual y última', () => {
  assert.deepEqual(paginasVisibles(10, 20), [1, '…', 9,10,11, '…', 20]);
});
