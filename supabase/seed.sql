-- Datos de prueba (Estética Demo)
insert into tenants (id, name, plan, status) values
  ('11111111-1111-1111-1111-111111111111','Estética Demo','recepcion_fidelizacion','active');
insert into brand_profiles (tenant_id, tono, diferencial, horarios) values
  ('11111111-1111-1111-1111-111111111111','cercano','Atención personalizada y profesional','Lun a Sáb 9 a 19');
insert into services (tenant_id, nombre, precio, duracion_min, recompra_dias) values
  ('11111111-1111-1111-1111-111111111111','Lifting de pestañas',18000,45,30),
  ('11111111-1111-1111-1111-111111111111','Esmaltado semipermanente',12000,60,21),
  ('11111111-1111-1111-1111-111111111111','Facial',16000,50,30);
