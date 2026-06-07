import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'

// RTK Query — handles all API calls to our backend
// Automatically manages loading states, caching, and errors
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://nimbusiq.onrender.com/api',
    // prepareHeaders runs before every single API call
    // It reads the JWT token from cookies and attaches it
    // Without this, every protected route returns 401 Unauthorized
    prepareHeaders: (headers) => {
      const token = Cookies.get('nimbusiq_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['EC2', 'S3', 'Costs', 'Alerts', 'Credentials', 'Optimizer'],
  endpoints: (builder) => ({
    // EC2 endpoints
    getEC2Instances: builder.query({
      query: () => '/ec2/instances',
      providesTags: ['EC2']
    }),
    // S3 endpoints
    getS3Buckets: builder.query({
      query: () => '/s3/buckets',
      providesTags: ['S3']
    }),
    // Cost endpoints
    getDailyCosts: builder.query({
      query: () => '/costs/daily',
      providesTags: ['Costs']
    }),
    getCostByService: builder.query({
      query: () => '/costs/by-service',
      providesTags: ['Costs']
    }),
    getMonthlyTotal: builder.query({
      query: () => '/costs/monthly-total',
      providesTags: ['Costs']
    }),
    // Alert endpoints
    getAlerts: builder.query({
      query: () => '/alerts',
      providesTags: ['Alerts']
    }),
    getAlertHistory: builder.query({
      query: () => '/alerts/history',
      providesTags: ['Alerts']
    }),
    saveAlert: builder.mutation({
      query: (body) => ({
        url: '/alerts',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Alerts']
    }),
    // Credentials endpoints
    getCredentials: builder.query({
      query: () => '/credentials',
      providesTags: ['Credentials']
    }),
    saveCredentials: builder.mutation({
      query: (body) => ({
        url: '/credentials',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Credentials']
    }),
    testCredentials: builder.mutation({
      query: () => ({
        url: '/credentials/test',
        method: 'POST'
      }),
      invalidatesTags: ['Credentials']
    }),
    deleteCredentials: builder.mutation({
      query: () => ({
        url: '/credentials',
        method: 'DELETE'
      }),
      invalidatesTags: ['Credentials']
    }),
    // Optimizer endpoints
    runOptimizer: builder.mutation({
      query: () => ({
        url: '/optimizer/analyze',
        method: 'POST'
      }),
      invalidatesTags: ['Optimizer']
    }),
    getRecommendations: builder.query({
      query: () => '/optimizer/recommendations',
      providesTags: ['Optimizer']
    }),
    updateRecommendationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/optimizer/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['Optimizer']
    })
  })
})

export const {
  useGetEC2InstancesQuery,
  useGetS3BucketsQuery,
  useGetDailyCostsQuery,
  useGetCostByServiceQuery,
  useGetMonthlyTotalQuery,
  useGetAlertsQuery,
  useGetAlertHistoryQuery,
  useSaveAlertMutation,
  useGetCredentialsQuery,
  useSaveCredentialsMutation,
  useTestCredentialsMutation,
  useDeleteCredentialsMutation,
  useRunOptimizerMutation,
  useGetRecommendationsQuery,
  useUpdateRecommendationStatusMutation
} = api