/**
 * Static project data for the XGE Climate Explorer
 * Contains Canadian climate and sustainability initiatives
 */

import type { Project } from '$lib/types';

export const projects: Project[] = [
  {
    id: 'boreal-forest-restoration',
    title: 'Canadian Boreal Forest Restoration Initiative',
    description:
      'Large-scale reforestation project focused on restoring degraded areas of the Canadian boreal forest across Saskatchewan and Manitoba. The initiative combines tree planting with habitat restoration to support wildlife populations, improve carbon sequestration, and enhance ecosystem resilience against climate change.',
    impactCategory: 'conservation',
    region: 'north-america',
    coordinates: [-106.3468, 52.9399] // Saskatchewan, Canada
  },
  {
    id: 'offshore-wind-nova-scotia',
    title: 'Nova Scotia Offshore Wind Project',
    description:
      'Pioneering offshore wind energy development off the coast of Nova Scotia, featuring advanced floating wind turbines designed for deep Atlantic waters. This project aims to generate clean electricity for Maritime provinces while creating jobs in the emerging offshore wind industry.',
    impactCategory: 'renewable-energy',
    region: 'north-america',
    coordinates: [-63.5859, 44.6820] // Nova Scotia, Canada
  },
  {
    id: 'urban-farming-toronto',
    title: 'Toronto Vertical Agriculture Network',
    description:
      'Innovative urban agriculture initiative utilizing vertical farming and hydroponic technology across Toronto\'s urban landscape. This project reduces food transportation emissions, provides fresh produce year-round, and demonstrates sustainable food production methods in Canada\'s largest city.',
    impactCategory: 'sustainable-agriculture',
    region: 'north-america',
    coordinates: [-79.3832, 43.6532] // Toronto, Ontario
  },
  {
    id: 'plastic-waste-vancouver',
    title: 'Vancouver Circular Waste Management Program',
    description:
      'Comprehensive waste reduction and recycling initiative in Vancouver, focusing on plastic waste elimination and circular economy principles. The program includes advanced sorting facilities, community education, and partnerships with local businesses to achieve zero waste goals.',
    impactCategory: 'waste-management',
    region: 'north-america',
    coordinates: [-123.1207, 49.2827] // Vancouver, British Columbia
  },
  {
    id: 'solar-alberta',
    title: 'Alberta Solar Farm Initiative',
    description:
      'Large-scale solar energy project in southern Alberta, taking advantage of the region\'s high solar irradiance levels. This initiative includes multiple solar installations across rural Alberta, providing clean energy to the provincial grid while supporting local agricultural communities.',
    impactCategory: 'renewable-energy',
    region: 'north-america',
    coordinates: [-113.4909, 51.0447] // Calgary area, Alberta
  },
  {
    id: 'wetland-conservation-manitoba',
    title: 'Manitoba Prairie Wetland Conservation',
    description:
      'Critical wetland preservation and restoration project across Manitoba\'s prairie pothole region. This conservation initiative protects vital waterfowl habitat, improves water quality, and enhances carbon storage while supporting biodiversity in Canada\'s agricultural heartland.',
    impactCategory: 'conservation',
    region: 'north-america',
    coordinates: [-97.1384, 49.8951] // Winnipeg area, Manitoba
  }
];
