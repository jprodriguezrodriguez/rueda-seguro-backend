// controllers/motorcycleController.js
// Ejemplo de controlador para manejar operaciones de motos

class MotorcycleController {
    constructor() {
        // Simulamos una "base de datos" en memoria para fines de demostración
        this.motorcycles = [
            {
                id: 1,
                marca: 'Honda',
                modelo: 'CBR600RR',
                año: 2023,
                color: 'Rojo',
                cilindrada: 599,
                precio: 12500,
                disponible: true,
                owner_id: null,
                created_at: new Date().toISOString(),
                descripcion: 'Deportiva de alta performance para pista y calle'
            },
            {
                id: 2,
                marca: 'Yamaha',
                modelo: 'MT-09',
                año: 2024,
                color: 'Azul',
                cilindrada: 890,
                precio: 9800,
                disponible: true,
                owner_id: null,
                created_at: new Date().toISOString(),
                descripcion: 'Naked bike con motor de triple cilindro'
            },
            {
                id: 3,
                marca: 'Kawasaki',
                modelo: 'Ninja ZX-10R',
                año: 2023,
                color: 'Verde',
                cilindrada: 998,
                precio: 16200,
                disponible: false,
                owner_id: null,
                created_at: new Date().toISOString(),
                descripcion: 'Superbike diseñada para competición'
            }
        ];
        this.nextId = 4;
    }

    // GET /api/motorcycles - Obtener todas las motos
    getAllMotorcycles(req, res) {
        try {
            const { available, marca, min_price, max_price } = req.query;
            let filteredMotorcycles = [...this.motorcycles];

            // Filtrar por disponibilidad
            if (available !== undefined) {
                const isAvailable = available === 'true';
                filteredMotorcycles = filteredMotorcycles.filter(moto => moto.disponible === isAvailable);
            }

            // Filtrar por marca
            if (marca) {
                filteredMotorcycles = filteredMotorcycles.filter(moto => 
                    moto.marca.toLowerCase().includes(marca.toLowerCase())
                );
            }

            // Filtrar por rango de precio
            if (min_price) {
                filteredMotorcycles = filteredMotorcycles.filter(moto => moto.precio >= Number.Number.parseFloat(min_price));
            }

            if (max_price) {
                filteredMotorcycles = filteredMotorcycles.filter(moto => moto.precio <= Number.Number.parseFloat(max_price));
            }

            res.json({
                success: true,
                message: `${filteredMotorcycles.length} motos encontradas`,
                data: {
                    motorcycles: filteredMotorcycles,
                    total: filteredMotorcycles.length,
                    filters_applied: {
                        available,
                        marca,
                        min_price,
                        max_price
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error obteniendo motos',
                error: error.message
            });
        }
    }

    // GET /api/motorcycles/:id - Obtener una moto específica
    getMotorcycleById(req, res) {
        try {
            const id = Number.parseInt(req.params.id);
            const motorcycle = this.motorcycles.find(moto => moto.id === id);

            if (!motorcycle) {
                return res.status(404).json({
                    success: false,
                    message: `Moto con ID ${id} no encontrada`
                });
            }

            res.json({
                success: true,
                message: 'Moto encontrada exitosamente',
                data: {
                    motorcycle
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error obteniendo moto',
                error: error.message
            });
        }
    }

    // POST /api/motorcycles - Crear nueva moto
    createMotorcycle(req, res) {
        try {
            const { marca, modelo, año, color, cilindrada, precio, descripcion } = req.body;

            // Validaciones básicas
            if (!marca || !modelo || !año || !color || !cilindrada || !precio) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios: marca, modelo, año, color, cilindrada, precio'
                });
            }

            const newMotorcycle = {
                id: this.nextId++,
                marca,
                modelo,
                año: Number.parseInt(año),
                color,
                cilindrada: Number.parseInt(cilindrada),
                precio: Number.parseFloat(precio),
                descripcion: descripcion || '',
                disponible: true,
                owner_id: null, // Se asignaría al usuario cuando compre
                created_at: new Date().toISOString()
            };

            this.motorcycles.push(newMotorcycle);

            res.status(201).json({
                success: true,
                message: `Moto ${marca} ${modelo} creada exitosamente`,
                data: {
                    motorcycle: newMotorcycle
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creando moto',
                error: error.message
            });
        }
    }

    // PUT /api/motorcycles/:id - Actualizar moto existente
    updateMotorcycle(req, res) {
        try {
            const id = Number.parseInt(req.params.id);
            const motorcycleIndex = this.motorcycles.findIndex(moto => moto.id === id);

            if (motorcycleIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: `Moto con ID ${id} no encontrada`
                });
            }

            // Actualizar solo los campos proporcionados
            const allowedUpdates = new Set(
                ['marca', 'modelo', 'año', 'color', 'cilindrada', 'precio', 'descripcion', 'disponible']
            );
            const updates = {};

            for (let key in req.body) {
                if (allowedUpdates.has(key)) {
                    updates[key] = req.body[key];
                }
            }

            this.motorcycles[motorcycleIndex] = {
                ...this.motorcycles[motorcycleIndex],
                ...updates,
                updated_at: new Date().toISOString()
            };

            res.json({
                success: true,
                message: `Moto con ID ${id} actualizada exitosamente`,
                data: {
                    motorcycle: this.motorcycles[motorcycleIndex]
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error actualizando moto',
                error: error.message
            });
        }
    }

    // DELETE /api/motorcycles/:id - Eliminar moto
    deleteMotorcycle(req, res) {
        try {
            const id = Number.parseInt(req.params.id);
            const motorcycleIndex = this.motorcycles.findIndex(moto => moto.id === id);

            if (motorcycleIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: `Moto con ID ${id} no encontrada`
                });
            }

            const deletedMotorcycle = this.motorcycles.splice(motorcycleIndex, 1)[0];

            res.json({
                success: true,
                message: `Moto ${deletedMotorcycle.marca} ${deletedMotorcycle.modelo} eliminada exitosamente`,
                data: {
                    deleted_motorcycle: deletedMotorcycle
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error eliminando moto',
                error: error.message
            });
        }
    }

    // POST /api/motorcycles/:id/purchase - Simular compra de moto
    purchaseMotorcycle(req, res) {
        try {
            const motorcycleId = Number.parseInt(req.params.id);
            const userId = req.user.id; // Del middleware de autenticación
            
            const motorcycleIndex = this.motorcycles.findIndex(moto => moto.id === motorcycleId);

            if (motorcycleIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: `Moto con ID ${motorcycleId} no encontrada`
                });
            }

            if (!this.motorcycles[motorcycleIndex].disponible) {
                return res.status(400).json({
                    success: false,
                    message: 'Esta moto ya no está disponible'
                });
            }

            // Simular la compra
            this.motorcycles[motorcycleIndex].disponible = false;
            this.motorcycles[motorcycleIndex].owner_id = userId;
            this.motorcycles[motorcycleIndex].purchase_date = new Date().toISOString();

            res.json({
                success: true,
                message: `¡Felicitaciones! Has comprado la moto ${this.motorcycles[motorcycleIndex].marca} ${this.motorcycles[motorcycleIndex].modelo}`,
                data: {
                    motorcycle: this.motorcycles[motorcycleIndex],
                    transaction: {
                        id: `txn_${Date.now()}`,
                        amount: this.motorcycles[motorcycleIndex].precio,
                        currency: 'USD',
                        timestamp: new Date().toISOString()
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error procesando compra',
                error: error.message
            });
        }
    }

    // GET /api/motorcycles/stats - Estadísticas de las motos
    getMotorcycleStats(req, res) {
        try {
            const totalMotorcycles = this.motorcycles.length;
            const availableMotorcycles = this.motorcycles.filter(moto => moto.disponible).length;
            const soldMotorcycles = totalMotorcycles - availableMotorcycles;
            
            const marcas = [...new Set(this.motorcycles.map(moto => moto.marca))];
            const averagePrice = this.motorcycles.reduce((acc, moto) => acc + moto.precio, 0) / totalMotorcycles;
            
            const priceRange = {
                min: Math.min(...this.motorcycles.map(moto => moto.precio)),
                max: Math.max(...this.motorcycles.map(moto => moto.precio))
            };

            const motosbyMarca = marcas.reduce((acc, marca) => {
                acc[marca] = this.motorcycles.filter(moto => moto.marca === marca).length;
                return acc;
            }, {});

            res.json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: {
                    inventory: {
                        total_motorcycles: totalMotorcycles,
                        available_motorcycles: availableMotorcycles,
                        sold_motorcycles: soldMotorcycles,
                        availability_rate: ((availableMotorcycles / totalMotorcycles) * 100).toFixed(2) + '%'
                    },
                    brands: {
                        total_brands: marcas.length,
                        brand_list: marcas,
                        motorcycles_by_brand: motosbyMarca
                    },
                    pricing: {
                        average_price: Number.parseFloat(averagePrice.toFixed(2)),
                        price_range: priceRange,
                        currency: 'USD'
                    },
                    last_updated: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estadísticas',
                error: error.message
            });
        }
    }
}

module.exports = MotorcycleController;