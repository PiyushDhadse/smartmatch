// controllers/services.controller.js
const supabase = require('../config/supabase');
const ApiResponse = require('../utils/response');
const Validation = require('../utils/validation');

class ServiceController {
  // Get all services (with filtering)
  static async getAllServices(req, res) {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          service_providers:provider_id (
            user_id,
            is_verified,
            rating,
            availability_status,
            users:user_id (
              name,
              avatar_url
            )
          )
        `)
        .eq('is_active', true);

      // Apply filters if provided
      if (req.query.category) {
        query = query.eq('category', req.query.category);
      }

      if (req.query.location) {
        query = query.ilike('location', `%${req.query.location}%`);
      }

      if (req.query.min_price) {
        query = query.gte('price', req.query.min_price);
      }

      if (req.query.max_price) {
        query = query.lte('price', req.query.max_price);
      }

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort;
        const order = req.query.order || 'asc';
        query = query.order(sortBy, { ascending: order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: services, error, count } = await query;

      if (error) {
        throw error;
      }

      return ApiResponse.success(res, {
        services,
        count: services?.length || 0
      }, 'Services retrieved successfully');
    } catch (error) {
      console.error('Get services error:', error);
      return ApiResponse.error(res, 'Failed to retrieve services');
    }
  }

  // Get service by ID
  static async getServiceById(req, res) {
    try {
      const { id } = req.params;

      const { data: service, error } = await supabase
        .from('services')
        .select(`
          *,
          service_providers:provider_id (
            user_id,
            is_verified,
            rating,
            total_jobs,
            availability_status,
            users:user_id (
              name,
              email,
              phone,
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error || !service) {
        return ApiResponse.notFound(res, 'Service not found');
      }

      return ApiResponse.success(res, service, 'Service retrieved successfully');
    } catch (error) {
      console.error('Get service error:', error);
      return ApiResponse.error(res, 'Failed to retrieve service');
    }
  }

  // Create new service (provider only)
  static async createService(req, res) {
    try {
      const validation = Validation.validateServiceInput(req.body);
      if (!validation.isValid) {
        return ApiResponse.validationError(res, validation.errors);
      }

      // Check if user is a provider
      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', req.userId)
        .single();

      if (providerError || !provider) {
        return ApiResponse.forbidden(res, 'Only service providers can create services');
      }

      const serviceData = {
        provider_id: provider.id,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        location: req.body.location,
        is_active: true
      };

      const { data: service, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select(`
          *,
          service_providers:provider_id (
            users:user_id (
              name
            )
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      return ApiResponse.success(res, service, 'Service created successfully', 201);
    } catch (error) {
      console.error('Create service error:', error);
      return ApiResponse.error(res, 'Failed to create service');
    }
  }

  // Update service (provider only)
  static async updateService(req, res) {
    try {
      const { id } = req.params;
      
      // Check if service exists and belongs to provider
      const { data: existingService, error: checkError } = await supabase
        .from('services')
        .select('provider_id')
        .eq('id', id)
        .single();

      if (checkError || !existingService) {
        return ApiResponse.notFound(res, 'Service not found');
      }

      // Verify provider owns this service
      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', req.userId)
        .eq('id', existingService.provider_id)
        .single();

      if (!provider) {
        return ApiResponse.forbidden(res, 'You can only update your own services');
      }

      const updateData = {
        updated_at: new Date().toISOString()
      };

      // Update only provided fields
      const allowedFields = ['title', 'description', 'category', 'price', 'location', 'is_active'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const { data: service, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return ApiResponse.success(res, service, 'Service updated successfully');
    } catch (error) {
      console.error('Update service error:', error);
      return ApiResponse.error(res, 'Failed to update service');
    }
  }

  // Delete service (provider only)
  static async deleteService(req, res) {
    try {
      const { id } = req.params;

      // Check if service exists and belongs to provider
      const { data: existingService } = await supabase
        .from('services')
        .select('provider_id')
        .eq('id', id)
        .single();

      if (!existingService) {
        return ApiResponse.notFound(res, 'Service not found');
      }

      // Verify provider owns this service
      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', req.userId)
        .eq('id', existingService.provider_id)
        .single();

      if (!provider) {
        return ApiResponse.forbidden(res, 'You can only delete your own services');
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('services')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return ApiResponse.success(res, null, 'Service deleted successfully');
    } catch (error) {
      console.error('Delete service error:', error);
      return ApiResponse.error(res, 'Failed to delete service');
    }
  }

  // Get provider's services
  static async getMyServices(req, res) {
    try {
      // Check if user is a provider
      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', req.userId)
        .single();

      if (providerError || !provider) {
        return ApiResponse.forbidden(res, 'Only service providers have services');
      }

      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return ApiResponse.success(res, services, 'Services retrieved successfully');
    } catch (error) {
      console.error('Get my services error:', error);
      return ApiResponse.error(res, 'Failed to retrieve services');
    }
  }
}

module.exports = ServiceController;