/**
 * Static project data for the XGE Project Explorer
 * 
 * Contains curated Canadian climate and sustainability initiatives.
 * Projects are manually verified and represent real-world implementations
 * across various impact categories to showcase diverse climate solutions.
 * 
 * @fileoverview Project data repository for climate initiatives mapping
 * @version 1.0.0
 */

import type { Project } from '$lib/types';

/**
 * Collection of verified Canadian climate and sustainability projects
 * 
 * Each project represents a real initiative with geographic coordinates
 * for map visualization. Data is manually curated to ensure accuracy
 * and relevance to climate action efforts.
 */
export const projects: Project[] = [
  {
    id: 'two-billion-trees',
    title: 'Two Billion Trees Program',
    description:
      'The Government of Canada\'s commitment to plant two billion trees by 2031 to help fight climate change, create jobs, and support biodiversity. This national reforestation initiative works with provinces, territories, Indigenous communities, and private landowners to restore forests across the country.',
    impactCategory: 'conservation',
    region: 'north-america',
    coordinates: [-106.3468, 52.9399], // Saskatchewan
    url: 'https://www.canada.ca/en/campaign/2-billion-trees.html',
    verified: true,
    source: 'Government of Canada',
    dateVerified: '2025-08-13'
  },
  {
    id: 'travers-solar',
    title: 'Travers Solar Project',
    description:
      'Canada\'s largest solar project located near Vulcan, Alberta. This 465 MW solar facility generates clean electricity for approximately 150,000 homes and represents a significant milestone in Alberta\'s renewable energy transition, supporting the province\'s net-zero goals.',
    impactCategory: 'renewable-energy',
    region: 'north-america',
    coordinates: [-113.335, 50.506], // Vulcan, Alberta
    url: 'https://www.greengatepower.com/travers-solar',
    verified: true,
    source: 'Greengate Power Corporation',
    dateVerified: '2025-08-13'
  },
  {
    id: 'toronto-urban-agriculture',
    title: 'Toronto Urban Agriculture Strategy',
    description:
      'The City of Toronto\'s comprehensive strategy to increase local food production, improve food security, and reduce environmental impacts through urban farming initiatives. This includes community gardens, rooftop farming, and innovative growing technologies across Canada\'s largest city.',
    impactCategory: 'sustainable-agriculture',
    region: 'north-america',
    coordinates: [-79.3832, 43.6532], // Toronto
    url: 'https://www.toronto.ca/city-government/planning-development/planning-studies-initiatives/urban-agriculture/',
    verified: true,
    source: 'City of Toronto',
    dateVerified: '2025-08-13'
  },
  {
    id: 'vancouver-zero-waste',
    title: 'Vancouver Zero Waste 2040',
    description:
      'Vancouver\'s ambitious plan to become a zero waste city by 2040, focusing on waste reduction, reuse, and recycling programs. This comprehensive initiative includes circular economy principles, extended producer responsibility, and community engagement to eliminate waste sent to landfills.',
    impactCategory: 'waste-management',
    region: 'north-america',
    coordinates: [-123.1207, 49.2827], // Vancouver
    url: 'https://vancouver.ca/green-vancouver/zero-waste-vancouver.aspx',
    verified: true,
    source: 'City of Vancouver',
    dateVerified: '2025-08-13'
  },
  {
    id: 'everwind-green-hydrogen',
    title: 'EverWind Green Hydrogen Project',
    description:
      'Atlantic Canada\'s first large-scale green hydrogen and ammonia production facility in Nova Scotia. This project harnesses wind energy to produce clean hydrogen for export and domestic use, positioning Canada as a leader in the global green hydrogen economy.',
    impactCategory: 'renewable-energy',
    region: 'north-america',
    coordinates: [-63.5859, 44.6820], // Nova Scotia
    url: 'https://everwindfuels.com/',
    verified: true,
    source: 'EverWind Fuels',
    dateVerified: '2025-08-13'
  },
  {
    id: 'ducks-unlimited-prairie-wetlands',
    title: 'Prairie Wetland Conservation (Ducks Unlimited)',
    description:
      'Ducks Unlimited Canada\'s ongoing wetland conservation efforts across the Prairie Pothole Region of Manitoba, Saskatchewan, and Alberta. This critical program protects and restores wetland habitats that support waterfowl, improve water quality, and provide natural climate solutions through carbon storage.',
    impactCategory: 'conservation',
    region: 'north-america',
    coordinates: [-97.1384, 49.8951], // Winnipeg, Manitoba
    url: 'https://www.ducks.ca/places/manitoba/',
    verified: true,
    source: 'Ducks Unlimited Canada',
    dateVerified: '2025-08-13'
  }
];
