import { Review } from "../models/mongoDB/review.model.js";

export class Artist {
    static async getArtistReview(req) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) === -1 ? null : parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.limit) === -1 ? null : (page - 1) * limit;

        const data = await Review.aggregate([
            [
                {
                    $match: {
                        artist_id: parseInt(req.params.id)
                    }
                },
                {
                    $facet: {
                        reviews: [
                            {
                                $sort: {
                                    createdAt: -1,
                                    _id: -1
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    rating: 1,
                                    comment: 1,
                                    createdAt: 1
                                }
                            },
                            {
                                $skip: skip
                            },
                            {
                                $limit: limit
                            }
                        ],
                        summary: [
                            {
                                $group: {
                                    _id: null,
                                    averageScore: {
                                        $avg: "$rating"
                                    },
                                    totalCount: {
                                        $sum: 1
                                    },
                                    ratings: {
                                        $push: "$rating"
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    averageScore: {
                                        $round: ["$averageScore", 2]
                                    },
                                    totalCount: 1,
                                    scoreDistribution: {
                                        $arrayToObject: {
                                            $map: {
                                                input: [1, 2, 3, 4, 5],
                                                as: "score",
                                                in: {
                                                    k: {
                                                        $toString: "$$score"
                                                    },
                                                    v: {
                                                        $size: {
                                                            $filter: {
                                                                input: "$ratings",
                                                                as: "rating",
                                                                cond: {
                                                                    $eq: [
                                                                        "$$rating",
                                                                        "$$score"
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        ])

        const summary = data[0]?.summary[0] || {};
        return {
            reviews: data[0]?.reviews || [],
            summary: summary,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil((summary?.totalCount || 0) / limit)
            },
        }
    }

    static async getTopArtistsForLeaderboard(req) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);

        const artistReviews = await Review.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: "$artist_id",
                    averageScore: { $avg: "$rating" },
                    totalReviewCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    totalReviewCount: { $gte: 5 }
                }
            },
            {
                $project: {
                    _id: 0,
                    artistId: "$_id",
                    averageScore: {
                        $round: ["$averageScore", 2]
                    },
                    totalReviewCount: 1
                }
            },
            {
                $sort: {
                    averageScore: -1,
                    totalReviewCount: -1
                }
            },
            {
                $limit: 10
            }
        ]);

        return artistReviews;
    }
}