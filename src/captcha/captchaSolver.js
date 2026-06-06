/**
 * Captcha Solver Module
 * Handles captcha image extraction and Gemini-based solving
 */

import { logger, ai } from '../config.js';

/**
 * Captures the captcha image, sends it to Gemini API, and returns the solved text
 */
export async function solveCaptcha(page, captchaLocator) {
    try {
        logger.step('Solving Captcha');
        logger.debug('Extracting Captcha image');
        
        // Take an element-specific screenshot as a buffer
        const captchaBuffer = await captchaLocator.screenshot();
        const base64Image = captchaBuffer.toString('base64');
        logger.debug('Captcha image extracted and encoded');
        
        logger.debug('Sending to Gemini 1.5 Flash for resolution');
        
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { 
                            text: "Solve this mathematical equation or complete this sentence. Return ONLY the final answer as a plain string with no formatting, no punctuation, and no explanation." 
                        },
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: "image/png"
                            }
                        }
                    ]
                }
            ]
        });
        
        // Clean up the response (trim whitespace/newlines)
        const answer = response.text().trim();
        
        if (!answer) {
            throw new Error("Gemini returned an empty response for the captcha.");
        }
        
        logger.success('Captcha solved successfully', { answer: answer });
        return answer;
    } catch (error) {
        logger.exception(error, { function: 'solveCaptcha' });
        throw error;
    }
}
