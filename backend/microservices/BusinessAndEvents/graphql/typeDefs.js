const typeDefs = `#graphql
  type BusinessListing {
    id: ID!
    businessName: String!
    owner: ID
    description: String
    location: String
    phone: String
    email: String
    createdAt: String
  }

  type BusinessDeal {
    id: ID!
    listing: BusinessListing!
    title: String!
    details: String
    discountPercentage: Float
    startDate: String
    endDate: String
    createdAt: String
  }

  type CommunityEvent {
    id: ID!
    title: String!
    description: String
    organizer: ID!
    location: String
    date: String!
    createdAt: String
  }

  type Query {
    authorized: Boolean!
    businessListings: [BusinessListing]
    businessDeals: [BusinessDeal]
    communityEvents: [CommunityEvent]
    myBusinessListings: [BusinessListing]
    myBusinessDeals(listingId: ID!): [BusinessDeal]
    myCommunityEvents: [CommunityEvent]
  }

  type Mutation {
    createBusinessListing(
      businessName: String!
      owner: ID
      description: String
      location: String
      phone: String
      email: String
    ): BusinessListing

    createBusinessDeal(
      listing: ID!
      title: String!
      details: String
      discountPercentage: Float
      startDate: String
      endDate: String
    ): BusinessDeal

    createCommunityEvent(
      title: String!
      description: String
      organizer: ID
      location: String
      date: String!
    ): CommunityEvent
  }
`;

export default typeDefs;