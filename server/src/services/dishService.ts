import Dish from '../models/Dish';

interface GetDishesParams {
    page?: number;
    limit?: number;
    category?: string;
    region?: string;
    search?: string;
    sortBy?: string;
}

export const getDishes = async (params: GetDishesParams) => {
    const {
        page = 1,
        limit = 12,
        category,
        region,
        search,
        sortBy = '-createdAt',
    } = params;

    const query: any = {};

    if (category) {
        query.category = category;
    }

    if (region) {
        query.region = region;
    }

    if (search) {
        query.$or = [
            { 'name.ja': { $regex: search, $options: 'i' } },
            { 'name.vi': { $regex: search, $options: 'i' } },
        ];
    }

    const skip = (page - 1) * limit;

    const [dishes, total] = await Promise.all([
        Dish.find(query)
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .select('-history')
            .lean(),
        Dish.countDocuments(query),
    ]);

    return {
        dishes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getDishById = async (id: string) => {
    const dish = await Dish.findById(id).select('-history').lean();
    
    if (!dish) {
        throw new Error('Dish not found');
    }

    return dish;
};

export const createDish = async (dishData: any) => {
    const dish = await Dish.create(dishData);
    return dish;
};

export const updateDish = async (id: string, dishData: any, adminId: string) => {
    const dish = await Dish.findById(id);

    if (!dish) {
        throw new Error('Dish not found');
    }

    // Save current state to history
    dish.history.push({
        version: dish.history.length + 1,
        data: dish.toObject(),
        modifiedBy: adminId as any,
        modifiedAt: new Date(),
    });

    // Update dish
    Object.assign(dish, dishData);
    await dish.save();

    return dish;
};

export const deleteDish = async (id: string) => {
    const dish = await Dish.findByIdAndDelete(id);

    if (!dish) {
        throw new Error('Dish not found');
    }

    return dish;
};

export const getDishHistory = async (id: string) => {
    const dish = await Dish.findById(id).select('history').lean();

    if (!dish) {
        throw new Error('Dish not found');
    }

    return dish.history;
};

export const revertDishToVersion = async (id: string, version: number, adminId: string) => {
    const dish = await Dish.findById(id);

    if (!dish) {
        throw new Error('Dish not found');
    }

    const historyEntry = dish.history.find((h) => h.version === version);

    if (!historyEntry) {
        throw new Error('Version not found');
    }

    // Save current state to history before reverting
    dish.history.push({
        version: dish.history.length + 1,
        data: dish.toObject(),
        modifiedBy: adminId as any,
        modifiedAt: new Date(),
    });

    // Revert to the specified version
    Object.assign(dish, historyEntry.data);
    await dish.save();

    return dish;
};
