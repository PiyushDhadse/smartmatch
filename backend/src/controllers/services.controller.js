const { supabase } = require("../config/supabase");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");

/**
 * Get all services with optional filters
 * GET /api/services
 */
const getAllServices = async (req, res) => {
  try {
    const {
      category,
      location,
      min_price,
      max_price,
      search,
      page = 1,
      limit = 10,
      sort_by = "created_at",
      sort_order = "desc",
    } = req.query;

    let query = supabase
      .from("services")
      .select(
        `
        *,
        service_providers (
          id,
          availability_status,
          is_verified,
          users (
            id,
            name,
            phone
          )
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true);

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    if (min_price) {
      query = query.gte("price", parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte("price", parseFloat(max_price));
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sort_by, { ascending: sort_order === "asc" });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Get services error:", error);
      return sendError(res, `Failed to fetch services: ${error.message}`, 500);
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    return sendPaginated(
      res,
      data,
      pagination,
      "Services fetched successfully"
    );
  } catch (error) {
    console.error("Get services error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get service by ID
 * GET /api/services/:id
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        service_providers (
          id,
          availability_status,
          is_verified,
          users (
            id,
            name,
            phone
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return sendError(res, "Service not found", 404);
      }
      return sendError(res, "Failed to fetch service", 500);
    }

    return sendSuccess(res, data, "Service fetched successfully");
  } catch (error) {
    console.error("Get service error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Create a new service (Provider only)
 * POST /api/services
 */
const createService = async (req, res) => {
  try {
    const { title, description, category, price, location } = req.body;
    const providerId = req.provider.id;

    // Validation
    if (!title || !description || !category || !price || !location) {
      return sendError(res, "All fields are required", 400);
    }

    const { data, error } = await supabase
      .from("services")
      .insert({
        provider_id: providerId,
        title,
        description,
        category,
        price: parseFloat(price),
        location,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Create service error:", error);
      return sendError(res, "Failed to create service", 500);
    }

    return sendSuccess(res, data, "Service created successfully", 201);
  } catch (error) {
    console.error("Create service error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Update a service (Provider only, own service)
 * PUT /api/services/:id
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, location, is_active } =
      req.body;
    const providerId = req.provider.id;

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return sendError(res, "Service not found", 404);
    }

    if (existing.provider_id !== providerId) {
      return sendError(res, "Not authorized to update this service", 403);
    }

    // Build update object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = parseFloat(price);
    if (location !== undefined) updates.location = location;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from("services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update service error:", error);
      return sendError(res, "Failed to update service", 500);
    }

    return sendSuccess(res, data, "Service updated successfully");
  } catch (error) {
    console.error("Update service error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Delete a service (Provider only, own service)
 * DELETE /api/services/:id
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.provider.id;

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return sendError(res, "Service not found", 404);
    }

    if (existing.provider_id !== providerId) {
      return sendError(res, "Not authorized to delete this service", 403);
    }

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      console.error("Delete service error:", error);
      return sendError(res, "Failed to delete service", 500);
    }

    return sendSuccess(res, null, "Service deleted successfully");
  } catch (error) {
    console.error("Delete service error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get services by provider
 * GET /api/services/provider/:providerId
 */
const getServicesByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get provider services error:", error);
      return sendError(res, "Failed to fetch services", 500);
    }

    return sendSuccess(res, data, "Provider services fetched successfully");
  } catch (error) {
    console.error("Get provider services error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get service categories
 * GET /api/services/categories
 */
const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("category")
      .eq("is_active", true);

    if (error) {
      console.error("Get categories error:", error);
      return sendError(res, "Failed to fetch categories", 500);
    }

    // Get unique categories
    const categories = [...new Set(data.map((s) => s.category))].filter(
      Boolean
    );

    return sendSuccess(res, categories, "Categories fetched successfully");
  } catch (error) {
    console.error("Get categories error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get my services (authenticated provider)
 * GET /api/services/my-services
 */
const getMyServices = async (req, res) => {
  try {
    const providerId = req.provider.id;

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get my services error:", error);
      return sendError(res, "Failed to fetch services", 500);
    }

    return sendSuccess(res, data, "Your services fetched successfully");
  } catch (error) {
    console.error("Get my services error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByProvider,
  getCategories,
  getMyServices,
};
