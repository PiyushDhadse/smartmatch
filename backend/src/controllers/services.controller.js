const { supabase } = require("../config/supabase");

/**
 * @desc    Get all service categories
 * @route   GET /api/services/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch categories",
        error: error.message,
      });
    }

    res.json({
      success: true,
      count: data.length,
      categories: data,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all services with filters
 * @route   GET /api/services
 * @access  Public
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
      limit = 12,
      sort_by = "created_at",
      sort_order = "desc",
    } = req.query;

    // Build query
    let query = supabase
      .from("services")
      .select(
        `
        *,
        provider:users!provider_id(id, name, image, location),
        provider_profile:provider_profiles!provider_id(
          average_rating,
          total_reviews,
          verification_status,
          company_name
        ),
        category:categories!category_id(id, name, slug, icon)
      `,
        { count: "exact" }
      )
      .eq("status", "active");

    // Apply filters
    if (category) {
      query = query.eq("category_id", category);
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

    // Text search
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`
      );
    }

    // Sorting
    const validSortFields = [
      "created_at",
      "price",
      "title",
      "bookings_count",
      "views_count",
    ];
    const sortField = validSortFields.includes(sort_by) ? sort_by : "created_at";
    const ascending = sort_order === "asc";

    query = query.order(sortField, { ascending });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch services",
        error: error.message,
      });
    }

    res.json({
      success: true,
      count: data.length,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      services: data,
    });
  } catch (error) {
    console.error("Get all services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        provider:users!provider_id(id, name, email, image, phone, location, bio),
        provider_profile:provider_profiles!provider_id(
          average_rating,
          total_reviews,
          verification_status,
          company_name,
          years_of_experience,
          total_bookings,
          completed_bookings
        ),
        category:categories!category_id(id, name, slug, icon, description)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Increment view count
    await supabase
      .from("services")
      .update({ views_count: data.views_count + 1 })
      .eq("id", id);

    // Get recent reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select(
        `
        *,
        customer:users!customer_id(id, name, image)
      `
      )
      .eq("service_id", id)
      .order("created_at", { ascending: false })
      .limit(5);

    res.json({
      success: true,
      service: {
        ...data,
        reviews: reviews || [],
      },
    });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get services by provider
 * @route   GET /api/services/provider/:providerId
 * @access  Public
 */
const getServicesByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        category:categories!category_id(id, name, slug, icon)
      `
      )
      .eq("provider_id", providerId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch services",
        error: error.message,
      });
    }

    res.json({
      success: true,
      count: data.length,
      services: data,
    });
  } catch (error) {
    console.error("Get services by provider error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get authenticated provider's services
 * @route   GET /api/services/my-services
 * @access  Private (Provider only)
 */
const getMyServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        category:categories!category_id(id, name, slug, icon)
      `
      )
      .eq("provider_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch services",
        error: error.message,
      });
    }

    res.json({
      success: true,
      count: data.length,
      services: data,
    });
  } catch (error) {
    console.error("Get my services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private (Provider only)
 */
const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      category_id,
      title,
      description,
      price,
      pricing_type = "fixed",
      duration,
      location,
      service_area = [],
      images = [],
      tags = [],
      requirements,
      cancellation_policy,
      status = "active",
    } = req.body;

    // Validation
    if (!category_id || !title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: category_id, title, description, price",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be positive",
      });
    }

    // Check if category exists
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .single();

    if (categoryError || !category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { data, error } = await supabase
      .from("services")
      .insert({
        provider_id: userId,
        category_id,
        title,
        description,
        price,
        pricing_type,
        duration,
        location,
        service_area,
        images,
        tags,
        requirements,
        cancellation_policy,
        status,
      })
      .select(
        `
        *,
        category:categories!category_id(id, name, slug, icon)
      `
      )
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to create service",
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: data,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private (Provider only, own service)
 */
const updateService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if service belongs to user
    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (existingService.provider_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this service",
      });
    }

    const updateData = { ...req.body };
    delete updateData.provider_id; // Prevent changing provider
    delete updateData.id;

    const { data, error } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        category:categories!category_id(id, name, slug, icon)
      `
      )
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to update service",
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: "Service updated successfully",
      service: data,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Private (Provider only, own service)
 */
const deleteService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if service belongs to user
    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (existingService.provider_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this service",
      });
    }

    // Check if there are active bookings
    const { data: activeBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("service_id", id)
      .in("status", ["pending", "confirmed", "in_progress"])
      .limit(1);

    if (activeBookings && activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete service with active bookings",
      });
    }

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete service",
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
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