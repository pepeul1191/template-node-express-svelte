USE classroom;
SELECT `Representative`.*, `person`.`id` AS `person.id`, `person`.`names` AS `person.names`, `person`.`last_names` AS `person.last_names`, `person`.`document_number` AS `person.document_number`, `person`.`birth_date` AS `person.birth_date`, `person`.`image_url` AS `person.image_url`, `person->sex`.`id` AS `person.sex.id`, `person->sex`.`name` AS `person.sex.name`, `person->document_type`.`id` AS `person.document_type.id`, `person->document_type`.`name` AS `person.document_type.name`, `student_roles`.`id` AS `student_roles.id`, `student_roles`.`student_id` AS `student_roles.student_id`, `student_roles->role`.`id` AS `student_roles.role.id`, `student_roles->role`.`name` AS `student_roles.role.name` FROM (SELECT `Representative`.`id`, `Representative`.`email`, `Representative`.`user_id`, `Representative`.`person_id` FROM `representatives` AS `Representative` WHERE ( SELECT `representative_id` FROM `representatives_students_roles` AS `student_roles` WHERE (`student_roles`.`student_id` = 1 AND `student_roles`.`representative_id` = `Representative`.`id`) LIMIT 1 ) IS NOT NULL ORDER BY `Representative`.`id` ASC LIMIT 0, 20) AS `Representative` LEFT OUTER JOIN `persons` AS `person` ON `Representative`.`person_id` = `person`.`id` LEFT OUTER JOIN `sexs` AS `person->sex` ON `person`.`sex_id` = `person->sex`.`id` LEFT OUTER JOIN `document_types` AS `person->document_type` ON `person`.`document_type_id` = `person->document_type`.`id` INNER JOIN `representatives_students_roles` AS `student_roles` ON `Representative`.`id` = `student_roles`.`representative_id` AND `student_roles`.`student_id` = 1 LEFT OUTER JOIN `representative_roles` AS `student_roles->role` ON `student_roles`.`representative_role_id` = `student_roles->role`.`id` ORDER BY `Representative`.`id` ASC;

SELECT `Representative`.*, `person`.`id` AS `person.id`, `person`.`names` AS `person.names`, `person`.`last_names` AS `person.last_names`, `person`.`document_number` AS `person.document_number`, `person`.`birth_date` AS `person.birth_date`, `person`.`image_url` AS `person.image_url`, `person->sex`.`id` AS `person.sex.id`, `person->sex`.`name` AS `person.sex.name`, `person->document_type`.`id` AS `person.document_type.id`, `person->document_type`.`name` AS `person.document_type.name`, `student_roles`.`id` AS `student_roles.id`, `student_roles`.`student_id` AS `student_roles.student_id`, `student_roles->role`.`id` AS `student_roles.role.id`, `student_roles->role`.`name` AS `student_roles.role.name` FROM (SELECT `Representative`.`id`, `Representative`.`email`, `Representative`.`user_id`, `Representative`.`person_id` FROM `representatives` AS `Representative` WHERE ( SELECT `representative_id` FROM `representatives_students_roles` AS `student_roles` WHERE (`student_roles`.`student_id` = 1 AND `student_roles`.`representative_id` = `Representative`.`id`) LIMIT 1 ) IS NOT NULL ORDER BY `Representative`.`id` ASC LIMIT 0, 20) AS `Representative` LEFT OUTER JOIN `persons` AS `person` ON `Representative`.`person_id` = `person`.`id` LEFT OUTER JOIN `sexs` AS `person->sex` ON `person`.`sex_id` = `person->sex`.`id` LEFT OUTER JOIN `document_types` AS `person->document_type` ON `person`.`document_type_id` = `person->document_type`.`id` INNER JOIN `representatives_students_roles` AS `student_roles` ON `Representative`.`id` = `student_roles`.`representative_id` AND `student_roles`.`student_id` = 1 LEFT OUTER JOIN `representative_roles` AS `student_roles->role` ON `student_roles`.`representative_role_id` = `student_roles->role`.`id` ORDER BY `Representative`.`id` ASC;




SELECT * FROM representatives_students_roles;

USE classroom;

SELECT * FROM representatives;
SELECT * FROM persons WHERE id >= 531;
SELECT * FROM sexs;


-- solo lo suyo

SELECT
   R.id AS 'representative.id',
   CONCAT(P.last_names, ', ', P.names) AS 'person.full_name', 
   CONCAT(P.birth_date) AS 'person.birth_date', 
   P.image_url AS 'person.image_url', 
   P.sex_id AS 'person.sex_id', 
   DT.name AS 'document.type',
   P.document_number AS 'document.number',
   S.name AS 'sex.name', 
   RO.id AS 'representative_role.id', 
   RO.name AS 'representative_role.name' 
FROM representatives_students_roles RSR 
RIGHT JOIN representatives R ON R.id = RSR.representative_id
INNER JOIN persons P ON P.id = R.person_id
INNER JOIN document_types DT ON P.document_type_id = DT.id 
LEFT JOIN sexs S ON S.id = P.sex_id 
INNER JOIN representative_roles RO ON RO.id = RSR.representative_role_id
WHERE student_id = 1 
ORDER BY R.id ASC
LIMIT 9;

-- lo suyo y los que no

SELECT
   R.id AS 'representative.id',
   CONCAT(P.last_names, ', ', P.names) AS 'person.full_name', 
   P.birth_date AS 'person.birth_date', 
   P.image_url AS 'person.image_url', 
   DT.name AS 'document.type',
   P.document_number AS 'document.number', 
   S.name AS 'sex.name',
   RO.id AS 'representative_role.id', 
   RO.name AS 'representative_role.name' 
FROM representatives R
LEFT JOIN representatives_students_roles RSR 
       ON R.id = RSR.representative_id 
       AND RSR.student_id = 1
INNER JOIN persons P ON P.id = R.person_id
INNER JOIN document_types DT ON P.document_type_id = DT.id 
LEFT JOIN sexs S ON S.id = P.sex_id 
LEFT JOIN representative_roles RO 
       ON RO.id = RSR.representative_role_id
ORDER BY R.id ASC
LIMIT 9;

-- los que no

SELECT
   R.id AS 'representative.id',
   CONCAT(P.last_names, ', ', P.names) AS 'person.full_name', 
   P.birth_date AS 'person.birth_date', 
   P.image_url AS 'person.image_url', 
   DT.name AS 'document.type',
   P.document_number AS 'document.number', 
   S.name AS 'sex.name',
   RO.id AS 'representative_role.id', 
   RO.name AS 'representative_role.name' 
FROM representatives R
LEFT JOIN representatives_students_roles RSR 
       ON R.id = RSR.representative_id 
       AND RSR.student_id = 1
INNER JOIN persons P ON P.id = R.person_id
INNER JOIN document_types DT ON P.document_type_id = DT.id 
LEFT JOIN sexs S ON S.id = P.sex_id 
LEFT JOIN representative_roles RO 
       ON RO.id = RSR.representative_role_id
WHERE RSR.id IS NULL
ORDER BY R.id ASC
LIMIT 9;





