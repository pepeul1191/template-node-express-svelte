// management/controllers/representatives_controller.js
import * as repService from '../services/representative_service.js';
import * as personService from '../services/person_service.js';

export const fetchAll = async (req, res) => {
  try {
    const { name, document_number, email, step = 10, page = 1 } = req.query;
    const [reps, counts] = await Promise.all([
      repService.fetchRepresentatives({ name, document_number, email, step, page }),
      repService.countTotalPages({ name, document_number, email, step })
    ]);

    if (!reps || reps.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurso no encontrado', data: null, error: 'Error 404' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de representantes',
      data: { list: reps, pages: counts.totalPages, total: counts.totalRecords, offset: (page-1)*step },
      error: ''
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', data: null, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { person, email } = req.body;
    const rep = await repService.createFromPerson(person, email);

    return res.status(201).json({
      success: true,
      message: 'Representative creado correctamente',
      data: { id: rep.id, person_id: rep.person.id, created: rep.person.created || null, updated: rep.person.updated || null },
      error: ''
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno', data: null, error: error.error || error.message });
  }
};

export const fetchByPerson = async (req, res) => {
  try {
    const { personId } = req.params;
    if (!personId) return res.status(400).json({ success: false, message: 'personId es requerido', data: null, error: 'personId faltante' });

    const rep = await repService.findByPerson(personId);
    if (!rep) return res.status(404).json({ success: false, message: 'Representative no encontrado', data: null, error: 'Error 404' });

    return res.status(200).json({ success: true, message: 'Representative obtenido correctamente', data: rep, error: '' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno', data: null, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, person } = req.body;

    const rep = await repService.updateRepresentative(id, { email });
    if (person) await personService.updatePerson(rep.person_id, person);

    return res.status(200).json({ success: true, message: 'Representative actualizado correctamente', data: { updated: rep.updated || null }, error: '' });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno', data: null, error: error.error || error.message });
  }
};

export const deleteR = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID requerido', data: null, error: 'ID faltante' });

    await repService.deleteRepresentative(id);

    return res.status(200).json({ success: true, message: 'Representative eliminado correctamente', data: null, error: '' });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno', data: null, error: error.error || error.message });
  }
};

export const asociateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, email } = req.body;
    if (!id || !email) return res.status(400).json({ success: false, message: 'ID y correo requerido', data: null, error: 'ID faltante' });

    await repService.updateRepEmailUser(id, email, user_id ?? null);
    return res.status(200).json({ success: true, message: 'Representative actualizado correctamente', data: null, error: '' });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno', data: null, error: error.error || error.message });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID requerido', data: null, error: 'ID faltante' });

    await repService.removeUser(id);
    return res.status(200).json({ success: true, message: 'Representative actualizado correctamente', data: null, error: '' });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno', data: null, error: error.error || error.message });
  }
};