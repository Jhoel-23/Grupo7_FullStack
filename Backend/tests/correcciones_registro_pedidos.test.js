import test from "node:test";
import assert from "node:assert/strict";

// Los tests usan clientes PostgreSQL simulados; NO realizan consultas a Neon.
process.env.DATABASE_URL ||= "postgres://prueba:prueba@localhost:5432/pruebas_offline";
const { crearPedidoConInventario } = await import("../src/repositories/productos.repository.js");
const { crearClienteConRol } = await import("../src/repositories/comun.repository.js");

function poolFalso(resolver) {
  const llamadas=[];
  let liberado=false;
  const client={
    async query(text, params=[]) {
      llamadas.push({sql:text,params});
      return resolver(text, params);
    },
    release() {liberado=true;}
  };
  return {
    pool:{async connect(){return client;}},
    llamadas,
    liberado:()=>liberado
  };
}

test("Pedido: INSERT calcula cantidad × precio con tipos SQL explícitos y confirma la transacción",async()=>{
  const fake=poolFalso((sql,params)=>{
    if(sql.includes("SELECT codigo FROM pedidos_delivery_farmacia")) return {rowCount:0,rows:[]};
    if(sql.includes("FROM farmacia_productos WHERE id=$1 FOR UPDATE")) return {rowCount:1,rows:[{id:2,nombre:"Paracetamol",precio:"24.50",stock:6,activo:true}]};
    if(sql.includes("SELECT nextval(")) return {rowCount:1,rows:[{id:"25"}]};
    if(sql.includes("INSERT INTO pedidos_delivery_farmacia")) return {rowCount:1,rows:[{id:25,codigo:"PDF-00025",total:"49.00",estado:"pendiente"}]};
    return {rowCount:1,rows:[]};
  });
  const pedido=await crearPedidoConInventario(9,{productoId:2,cantidad:2,direccion:"Av. Lima 250"},fake.pool);
  assert.equal(pedido.codigo,"PDF-00025");
  const insert=fake.llamadas.find(x=>x.sql.includes("INSERT INTO pedidos_delivery_farmacia"));
  assert.ok(insert);
  assert.match(insert.sql,/\(\$6::integer\s*\*\s*\$7::numeric\)/);
  assert.match(insert.sql,/\$1::integer/);
  assert.match(insert.sql,/\$3::text/);
  assert.doesNotMatch(insert.sql,/LPAD\(\$1::text/);
  assert.equal((insert.sql.match(/\$1\b/g)||[]).length, 1);
  assert.deepEqual(insert.params,["25",9,"PDF-00025","Paracetamol",2,2,"24.50","Av. Lima 250"]);
  assert.equal(fake.llamadas.filter(x=>x.sql==="COMMIT").length,1);
  assert.equal(fake.llamadas.filter(x=>x.sql==="ROLLBACK").length,0);
  assert.ok(fake.liberado());
});

test("Pedido: codigo generado para mas de 5 digitos mantiene secuencia sin truncar", async()=>{
  const fake=poolFalso(sql=>{
    if(sql.includes("SELECT codigo FROM pedidos_delivery_farmacia")) return {rowCount:0,rows:[]};
    if(sql.includes("FROM farmacia_productos WHERE id=$1 FOR UPDATE")) return {rowCount:1,rows:[{id:15,nombre:"Medicamento",precio:"5.00",stock:20,activo:true}]};
    if(sql.includes("SELECT nextval(")) return {rows:[{id:"123456"}]};
    if(sql.includes("INSERT INTO pedidos_delivery_farmacia")) return {rowCount:1,rows:[{id:123456,codigo:"PDF-123456",total:"15.00",estado:"pendiente"}]};
    return {rowCount:1,rows:[]};
  });
  await crearPedidoConInventario(8,{productoId:15,cantidad:3,direccion:"Direccion"},fake.pool);
  const ins=fake.llamadas.find(x=>x.sql.includes("INSERT INTO pedidos_delivery_farmacia"));
  assert.equal(ins.params[2],"PDF-123456");
  assert.equal(ins.params[5],3);
  assert.equal(ins.params[6],"5.00");
  assert.ok(fake.llamadas.some(x=>x.sql==="COMMIT"));
});

test("Pedido: un error al insertar revierte la reserva de stock",async()=>{
  const fake=poolFalso(sql=>{
    if(sql.includes("SELECT codigo FROM pedidos_delivery_farmacia")) return {rowCount:0,rows:[]};
    if(sql.includes("FROM farmacia_productos WHERE id=$1 FOR UPDATE")) return {rowCount:1,rows:[{id:2,nombre:"Paracetamol",precio:"24.50",stock:5,activo:true}]};
    if(sql.includes("SELECT nextval(")) return {rows:[{id:25}]};
    if(sql.includes("INSERT INTO pedidos_delivery_farmacia")) throw Object.assign(new Error("Fallo simulado en PostgreSQL"),{code:"23514"});
    return {rowCount:1,rows:[]};
  });
  await assert.rejects(crearPedidoConInventario(9,{productoId:2,cantidad:1,direccion:"Av. Lima 250"},fake.pool),/Fallo simulado/);
  assert.ok(fake.llamadas.some(x=>x.sql.startsWith("UPDATE farmacia_productos SET stock=")));
  assert.ok(fake.llamadas.some(x=>x.sql==="ROLLBACK"));
  assert.ok(!fake.llamadas.some(x=>x.sql==="COMMIT"));
  assert.ok(fake.liberado());
});

test("Pedido: si ya existe uno pendiente devuelve 409 sin descontar stock",async()=>{
  const fake=poolFalso(sql=>sql.includes("SELECT codigo FROM pedidos_delivery_farmacia")
    ?{rowCount:1,rows:[{codigo:"PDF-00015"}]}:{rowCount:1,rows:[]});
  await assert.rejects(
    crearPedidoConInventario(9,{productoId:2,cantidad:1,direccion:"Av. Lima 250"},fake.pool),
    error=>error.status===409&&/pedido pendiente/.test(error.message)
  );
  assert.equal(fake.llamadas.filter(x=>x.sql.startsWith("UPDATE farmacia_productos")).length,0);
  assert.ok(fake.llamadas.some(x=>x.sql==="ROLLBACK"));
});

test("Registro: usuario y rol nuevos confirman juntos y devuelven usuario sin falso 409",async()=>{
  const user={id:27,nombre:"Prueba",apellido:"Usuario",dni:"12345678",correo:"prueba@ejemplo.pe"};
  const fake=poolFalso(sql=>{
    if(sql.includes("INSERT INTO usuarios")) return {rowCount:1,rows:[user]};
    if(sql.includes("INSERT INTO usuario_rol")) return {rowCount:1,rows:[{id_usuario:27}]};
    return {rowCount:1,rows:[]};
  });
  const result=await crearClienteConRol("Prueba","Usuario","12345678","prueba@ejemplo.pe","hash","farmacia",fake.pool);
  assert.deepEqual(result,[user]);
  assert.ok(fake.llamadas.some(x=>x.sql==="COMMIT"));
  assert.ok(!fake.llamadas.some(x=>x.sql==="ROLLBACK"));
  assert.equal(fake.llamadas.filter(x=>x.sql.includes("SELECT id, nombre, apellido, dni, correo")).length,0);
});

test("Registro: un usuario existente con DNI y correo coincidentes puede recibir un rol diferente",async()=>{
  const user={id:13,nombre:"Prueba",apellido:"Usuario",dni:"12345678",correo:"prueba@ejemplo.pe"};
  const fake=poolFalso(sql=>{
    if(sql.includes("INSERT INTO usuarios")) return {rowCount:0,rows:[]};
    if(sql.includes("FROM usuarios")&&sql.includes("FOR UPDATE")) return {rowCount:1,rows:[user]};
    if(sql.includes("INSERT INTO usuario_rol")) return {rowCount:1,rows:[{id_usuario:13}]};
    return {rowCount:1,rows:[]};
  });
  const result=await crearClienteConRol("Prueba","Usuario","12345678","prueba@ejemplo.pe","hash","banco",fake.pool);
  assert.deepEqual(result,[user]);
  assert.ok(fake.llamadas.some(x=>x.sql==="COMMIT"));
});

test("Registro: rol duplicado no deja usuario nuevo sin rol",async()=>{
  const fake=poolFalso(sql=>{
    if(sql.includes("INSERT INTO usuarios")) return {rowCount:1,rows:[{id:27,correo:"prueba@ejemplo.pe"}]};
    if(sql.includes("INSERT INTO usuario_rol")) return {rowCount:0,rows:[]};
    return {rowCount:1,rows:[]};
  });
  const result=await crearClienteConRol("Prueba","Usuario","12345678","prueba@ejemplo.pe","hash","farmacia",fake.pool);
  assert.deepEqual(result,[]);
  assert.ok(fake.llamadas.some(x=>x.sql==="ROLLBACK"));
  assert.ok(!fake.llamadas.some(x=>x.sql==="COMMIT"));
});

test("Registro: DNI distinto no permite asignar otro rol",async()=>{
  const fake=poolFalso(sql=>{
    if(sql.includes("INSERT INTO usuarios")) return {rowCount:0,rows:[]};
    if(sql.includes("FROM usuarios")&&sql.includes("FOR UPDATE")) return {rowCount:0,rows:[]};
    return {rowCount:1,rows:[]};
  });
  const result=await crearClienteConRol("Prueba","Usuario","88888888","prueba@ejemplo.pe","hash","banco",fake.pool);
  assert.deepEqual(result,[]);
  assert.ok(fake.llamadas.some(x=>x.sql==="ROLLBACK"));
  assert.ok(!fake.llamadas.some(x=>x.sql==="COMMIT"));
});
