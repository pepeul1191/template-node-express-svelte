-- migrate:up

-- =========================
-- TRIGGER: COURSE -> FOLDER ROOT
-- =========================
CREATE TRIGGER trg_after_insert_courses
AFTER INSERT ON courses
FOR EACH ROW
BEGIN
  DECLARE new_folder_id INT;

  INSERT INTO folders (parent_id, title, description)
  VALUES (NULL, CONCAT('Material - ', NEW.name), 'Root folder for course');

  SET new_folder_id = LAST_INSERT_ID();

  INSERT INTO folder_common_materials (id, course_id)
  VALUES (new_folder_id, NEW.id);
END;

-- =========================
-- TRIGGER: SECTION -> FOLDER ROOT
-- =========================
CREATE TRIGGER trg_after_insert_sections
AFTER INSERT ON sections
FOR EACH ROW
BEGIN
  DECLARE new_folder_id INT;

  INSERT INTO folders (parent_id, title, description)
  VALUES (NULL, CONCAT('Material - ', NEW.name), 'Root folder for section');

  SET new_folder_id = LAST_INSERT_ID();

  INSERT INTO folder_seccion_materials (id, section_id)
  VALUES (new_folder_id, NEW.id);
END;



-- migrate:down

DROP TRIGGER IF EXISTS trg_after_insert_courses;
DROP TRIGGER IF EXISTS trg_after_insert_sections;