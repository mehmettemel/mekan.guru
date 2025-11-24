import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Place Details API Proxy
 *
 * This endpoint proxies requests to Google Places API (New) to get detailed
 * information about a specific place using its place_id.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeId = searchParams.get('place_id');

    if (!placeId) {
      return NextResponse.json(
        { error: 'place_id parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Google Places API key is not configured' },
        { status: 500 }
      );
    }

    // Using the New Places API (Place Details)
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    // Define the fields we want to retrieve
    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'location',
      'googleMapsUri',
      'internationalPhoneNumber',
      'websiteUri',
      'rating',
      'userRatingCount',
      'priceLevel',
      'currentOpeningHours',
      'photos',
      'types',
      'addressComponents'
    ].join(',');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch place details from Google Places API', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Convert Google's price level string to integer
    const convertPriceLevel = (priceLevel: string | undefined): number | null => {
      if (!priceLevel) return null;
      const priceLevelMap: { [key: string]: number } = {
        'PRICE_LEVEL_FREE': 0,
        'PRICE_LEVEL_INEXPENSIVE': 1,
        'PRICE_LEVEL_MODERATE': 2,
        'PRICE_LEVEL_EXPENSIVE': 3,
        'PRICE_LEVEL_VERY_EXPENSIVE': 4,
      };
      return priceLevelMap[priceLevel] ?? null;
    };

    // Transform to a cleaner format
    const placeDetails = {
      google_place_id: data.id,
      name: data.displayName?.text,
      address: data.formattedAddress,
      location: data.location ? {
        lat: data.location.latitude,
        lng: data.location.longitude,
      } : null,
      google_maps_url: data.googleMapsUri,
      phone_number: data.internationalPhoneNumber,
      website: data.websiteUri,
      rating: data.rating,
      user_ratings_total: data.userRatingCount,
      price_level: convertPriceLevel(data.priceLevel),
      opening_hours: data.currentOpeningHours ? {
        weekday_text: data.currentOpeningHours.weekdayDescriptions,
        open_now: data.currentOpeningHours.openNow,
      } : null,
      photos: data.photos?.map((photo: any) => ({
        name: photo.name,
        width: photo.widthPx,
        height: photo.heightPx,
        // Construct photo URL
        // Format: https://places.googleapis.com/v1/{photo.name}/media?key=API_KEY&maxHeightPx=400&maxWidthPx=400
        url: `https://places.googleapis.com/v1/${photo.name}/media?key=${apiKey}&maxHeightPx=800&maxWidthPx=800`
      })) || [],
      types: data.types,
      address_components: data.addressComponents?.map((comp: any) => ({
        long_name: comp.longText,
        short_name: comp.shortText,
        types: comp.types,
      })) || [],
    } as any;

    // Extract city/district from address components for location matching
    const cityComponent = data.addressComponents?.find((comp: any) =>
      comp.types?.includes('locality') || comp.types?.includes('administrative_area_level_2')
    );

    const districtComponent = data.addressComponents?.find((comp: any) =>
      comp.types?.includes('sublocality') || comp.types?.includes('administrative_area_level_3')
    );

    if (cityComponent || districtComponent) {
      placeDetails.extracted_location = {
        city: cityComponent?.longText || cityComponent?.shortText,
        district: districtComponent?.longText || districtComponent?.shortText,
      };
    }

    return NextResponse.json(placeDetails);

  } catch (error: any) {
    console.error('Error in place details API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
