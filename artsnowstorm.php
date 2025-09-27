<?php
/**
 * 2009-2025 Tecnoacquisti.com
 *
 * For support feel free to contact us on our website at http://www.tecnoacquisti.com
 *
 * @author    Arte e Informatica <helpdesk@tecnoacquisti.com>
 * @copyright 2009-2025 Arte e Informatica
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 * @version   1.0.0
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class Artsnowstorm extends Module
{
    protected $config_form = false;

    public function __construct()
    {
        $this->name = 'artsnowstorm';
        $this->tab = 'front_office_features';
        $this->version = '1.0.3';
        $this->author = 'Tecnoacquisti.com';
        $this->need_instance = 0;

        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Art Free Snow Storm');
        $this->description = $this->l('The module inserts a javascript effect for a perfect storm of snow');

        $this->ps_versions_compliancy = array('min' => '1.6', 'max' => _PS_VERSION_);


    }

    /**
     * Don't forget to create update methods if needed:
     * http://doc.prestashop.com/display/PS16/Enabling+the+Auto-Update
     */
    public function install()
    {

        return parent::install() &&
			Configuration::updateValue('ARTSNOWSTORM_TWINKLE_EFFECT', '1') &&
			Configuration::updateValue('ARTSNOWSTORM_FOLLOW_MOUSE', '1') &&
			Configuration::updateValue('ARTSNOWSTORM_MAX_ACTIVE', '96') &&
			Configuration::updateValue('ARTSNOWSTORM_MAX', '128') &&
			Configuration::updateValue('ARTSNOWSTORM_SNOW_COLOR', '#99ccff') &&
			Configuration::updateValue('ARTSNOWSTORM_ON_BLUR', '1') &&
			Configuration::updateValue('ARTSNOWSTORM_SNOW_STICK', '1') &&
			Configuration::updateValue('ARTSNOWSTORM_EXCLUDE_M', '0') &&
            Configuration::updateValue('ARTSNOWSTORM_EMOJI', '●') &&
            Configuration::updateValue('ARTSNOWSTORM_FLAKE_SIZE', '24') &&
		    $this->registerHook('displayHeader');
    }

    public function uninstall()
    {
        Configuration::deleteByName('ARTSNOWSTORM_TWINKLE_EFFECT');
		Configuration::deleteByName('ARTSNOWSTORM_FOLLOW_MOUSE');
        Configuration::deleteByName('ARTSNOWSTORM_MAX_ACTIVE');
		Configuration::deleteByName('ARTSNOWSTORM_MAX');
		Configuration::deleteByName('ARTSNOWSTORM_SNOW_COLOR');
		Configuration::deleteByName('ARTSNOWSTORM_ON_BLUR');
		Configuration::deleteByName('ARTSNOWSTORM_SNOW_STICK');
		Configuration::deleteByName('ARTSNOWSTORM_EXCLUDE_M');
        Configuration::deleteByName('ARTSNOWSTORM_EMOJI');
        Configuration::deleteByName('ARTSNOWSTORM_FLAKE_SIZE');
        return parent::uninstall();
    }

    /**
     * Load the configuration form
     */
    public function getContent()
    {
        $output = null;
		$this->_errors = array();

		/**
         * If values have been submitted in the form, process.
         */
        if (((bool)Tools::isSubmit('submitArtsnowstormModule')) == true) {

			$artsnowstorm_twinkle_effect = Tools::getValue('ARTSNOWSTORM_TWINKLE_EFFECT');
			$artsnowstorm_follow_mouse = Tools::getValue('ARTSNOWSTORM_FOLLOW_MOUSE');
			$artsnowstorm_on_blur = Tools::getValue('ARTSNOWSTORM_ON_BLUR');
			$artsnowstorm_snow_stick = Tools::getValue('ARTSNOWSTORM_SNOW_STICK');
			$artsnowstorm_snow_color = Tools::getValue('ARTSNOWSTORM_SNOW_COLOR');
			$artsnowstorm_max_active = Tools::getValue('ARTSNOWSTORM_MAX_ACTIVE');
			$artsnowstorm_max = Tools::getValue('ARTSNOWSTORM_MAX');
			$artsnowstorm_exclude_m = Tools::getValue('ARTSNOWSTORM_EXCLUDE_M');
            $artsnowstorm_emoji = Tools::getValue('ARTSNOWSTORM_EMOJI');
            $artsnowstorm_emoji = pSQL(Tools::substr($artsnowstorm_emoji, 0, 8));

            $artsnowstorm_flake_size = Tools::getValue('ARTSNOWSTORM_FLAKE_SIZE');
            if ($artsnowstorm_flake_size === '') {
                $artsnowstorm_flake_size = Configuration::get('ARTSNOWSTORM_FLAKE_SIZE', 24);
            }

            if (!is_numeric($artsnowstorm_flake_size)) {
                $this->_errors[] = $this->l('Flake Size is NOT numeric');
            } else {
                $artsnowstorm_flake_size = (int)$artsnowstorm_flake_size;
                if ($artsnowstorm_flake_size > 150) {
                    $this->_errors[] = $this->l('Flake Size cannot exceed 150 px');
                }
            }

			if (!Validate::isColor($artsnowstorm_snow_color)) {
					    $this->_errors[] = 'Color not valid';
                }
			if (!is_numeric($artsnowstorm_max_active)) {
					    $this->_errors[] = 'Flakes Max is NOT numeric';
                }
			if (!is_numeric($artsnowstorm_max)) {
					    $this->_errors[] = 'Flakes Max Active is NOT numeric';
                }

			if (!count($this->_errors)){
				Configuration::updateValue('ARTSNOWSTORM_TWINKLE_EFFECT', (int)$artsnowstorm_twinkle_effect);
				Configuration::updateValue('ARTSNOWSTORM_FOLLOW_MOUSE', (int)$artsnowstorm_follow_mouse);
				Configuration::updateValue('ARTSNOWSTORM_ON_BLUR', (int)$artsnowstorm_on_blur);
				Configuration::updateValue('ARTSNOWSTORM_SNOW_STICK', (int)$artsnowstorm_snow_stick);
				Configuration::updateValue('ARTSNOWSTORM_SNOW_COLOR', pSQL($artsnowstorm_snow_color));
				Configuration::updateValue('ARTSNOWSTORM_MAX_ACTIVE', (int)$artsnowstorm_max_active);
				Configuration::updateValue('ARTSNOWSTORM_MAX', (int)$artsnowstorm_max);
				Configuration::updateValue('ARTSNOWSTORM_EXCLUDE_M', (int)$artsnowstorm_exclude_m);
                Configuration::updateValue('ARTSNOWSTORM_EMOJI', $artsnowstorm_emoji);
                Configuration::updateValue('ARTSNOWSTORM_FLAKE_SIZE', (int)$artsnowstorm_flake_size);
				$output .= $this->displayConfirmation($this->l('Settings updated'));
			} else {
				foreach ($this->_errors as $error)
					$errors = $error.' '.$this->l('Settings failed');

				$output .= $this->displayError($errors);
			}

        }

        $useSsl = (bool)Configuration::get('PS_SSL_ENABLED_EVERYWHERE') || (bool)Configuration::get('PS_SSL_ENABLED');
        $shop_base_url = $this->context->link->getBaseLink((int)$this->context->shop->id, $useSsl);

        $this->context->smarty->assign(array(
            'shop_base_url' => $shop_base_url,
        ));

        $output .= $this->context->smarty->fetch($this->local_path.'views/templates/admin/configure.tpl');
        $output .= $this->renderForm();
        $output .= $this->context->smarty->fetch($this->local_path.'views/templates/admin/copyright.tpl');

        return $output;

    }

    /**
     * Create the form that will be displayed in the configuration of your module.
     */
    protected function renderForm()
    {
        $helper = new HelperForm();

        $helper->show_toolbar = false;
        $helper->table = $this->table;
        $helper->module = $this;
        $helper->default_form_language = $this->context->language->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG', 0);

        $helper->identifier = $this->identifier;
        $helper->submit_action = 'submitArtsnowstormModule';
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false)
            .'&configure='.$this->name.'&tab_module='.$this->tab.'&module_name='.$this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');

        $helper->tpl_vars = array(
            'fields_value' => $this->getConfigFormValues(), /* Add values for your inputs */
            'languages' => $this->context->controller->getLanguages(),
            'id_language' => $this->context->language->id,
        );

        return $helper->generateForm(array($this->getConfigForm()));
    }

    /**
     * Create the structure of your form.
     */
    protected function getConfigForm()
    {
        return array(
            'form' => array(
                'legend' => array(
                'title' => $this->l('Settings'),
                'icon' => 'icon-cogs',
                ),
                'input' => array(
                    array(
                        'type' => 'select',
                        'label' => $this->l('Snow Emoji'),
                        'name' => 'ARTSNOWSTORM_EMOJI',
                        'required' => false,
                        'options' => array(
                            'query' => array(
                                array('id' => '●',   'name' => '● '.$this->l('Classic dot')),
                                array('id' => '🎃', 'name' => '🎃 '.$this->l('Pumpkin (Halloween)')),
                                array('id' => '👻', 'name' => '👻 '.$this->l('Ghost (Halloween)')),
                                array('id' => '❄️', 'name' => '❄️ '.$this->l('Snowflake')),
                                array('id' => '☃️', 'name' => '☃️ '.$this->l('Snowman')),
                                array('id' => '🎄', 'name' => '🎄 '.$this->l('Christmas Tree')),
                                array('id' => '🎅', 'name' => '🎅 '.$this->l('Santa')),
                                array('id' => '🎉',  'name' => '🎉 '.$this->l('Party Popper (New Year)')),
                                array('id' => '🥂',  'name' => '🥂 '.$this->l('Clinking Glasses (New Year)')),
                                array('id' => '❤️',  'name' => '❤️ '.$this->l('Heart (Valentine)')),
                                array('id' => '💘',  'name' => '💘 '.$this->l('Heart Arrow (Valentine)')),
                                array('id' => '🤡',  'name' => '🤡 '.$this->l('Clown (Carnival)')),
                                array('id' => '🎭',  'name' => '🎭 '.$this->l('Mask (Carnival)')),
                                array('id' => '🥳',  'name' => '🥳 '.$this->l('Celebration (Carnival)')),
                                array('id' => '🐣',  'name' => '🐣 '.$this->l('Chick (Easter)')),
                                array('id' => '🐰',  'name' => '🐰 '.$this->l('Bunny (Easter)')),
                                array('id' => '🌷',  'name' => '🌷 '.$this->l('Tulip (Easter)')),
                                array('id' => '🌸',  'name' => '🌸 '.$this->l('Cherry Blossom (Flower)')),
                                array('id' => '🌼',  'name' => '🌼 '.$this->l('Blossom (Flower)')),
                                array('id' => '🏵️', 'name' => '🏵️ '.$this->l('Rosette (Flower)')),
                            ),
                            'id' => 'id',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'col' => 3,
                        'type' => 'text',
                        'name' => 'ARTSNOWSTORM_FLAKE_SIZE',
                        'label' => $this->l('Flake Size (px)'),
                        'desc' => $this->l('Set the flake size in pixels (minimum 24 - maximum 150).'),
                        'required' => false,
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Use Twinkle Effect'),
                        'name' => 'ARTSNOWSTORM_TWINKLE_EFFECT',
                        'is_bool' => true,
                        'desc' => $this->l('Allow snow to randomly "flicker" in and out of view while falling'),
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => true,
                                'label' => $this->l('Enabled')
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => false,
                                'label' => $this->l('Disabled')
                            )
                        ),
                    ),
					array(
                        'type' => 'switch',
                        'label' => $this->l('Follow Mouse'),
                        'name' => 'ARTSNOWSTORM_FOLLOW_MOUSE',
                        'is_bool' => true,
                        'desc' => $this->l('Allows snow to move dynamically with the "wind", relative to the mouse\'s X (left/right) coordinates.'),
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => true,
                                'label' => $this->l('Enabled')
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => false,
                                'label' => $this->l('Disabled')
                            )
                        ),
                    ),
						array(
                        'type' => 'switch',
                        'label' => $this->l('Freeze On Blur'),
                        'name' => 'ARTSNOWSTORM_ON_BLUR',
                        'is_bool' => true,
                        'desc' => $this->l('Stops the snow effect when the browser window goes out of focus, eg., user is in another tab. Saves CPU, nicer to user.'),
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => true,
                                'label' => $this->l('Enabled')
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => false,
                                'label' => $this->l('Disabled')
                            )
                        ),
                    ),
							array(
                        'type' => 'switch',
                        'label' => $this->l('Snow Stick'),
                        'name' => 'ARTSNOWSTORM_SNOW_STICK',
                        'is_bool' => true,
                        'desc' => $this->l('Allows the snow to "stick" to the bottom of the window. When off, snow will never sit at the bottom.'),
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => true,
                                'label' => $this->l('Enabled')
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => false,
                                'label' => $this->l('Disabled')
                            )
                        ),
                    ),
                    array(
                        
                        'type' => 'color',
                        'desc' => $this->l('Enter the color in html format (es. #FFFFFF)'),
                        'name' => 'ARTSNOWSTORM_SNOW_COLOR',
                        'label' => $this->l('Snow Color'),
                    ),
					array(
					    'col' => 3,
                        'type' => 'text',
                        'name' => 'ARTSNOWSTORM_MAX',
                        'label' => $this->l('Flakes Max'),
						'desc' => $this->l('Sets the maximum number of snowflakes that can exist on the screen at any given time.'),
                    ),
                    array(
					    'col' => 3,
                        'type' => 'text',
                        'name' => 'ARTSNOWSTORM_MAX_ACTIVE',
                        'label' => $this->l('Flakes Max Active'),
						'desc' => $this->l('Sets the limit of "falling" snowflakes (ie. moving on the screen, thus considered to be active.)'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Exclude Mobile'),
                        'name' => 'ARTSNOWSTORM_EXCLUDE_M',
                        'is_bool' => true,
                        'desc' => $this->l('Exclude mobile devices (iPhone, Android ...)'),
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => true,
                                'label' => $this->l('Enabled')
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => false,
                                'label' => $this->l('Disabled')
                            )
                        ),
                    ),
                ),
                'submit' => array(
                    'title' => $this->l('Save'),
                ),
            ),
        );
    }

    /**
     * Set values for the inputs.
     */
    protected function getConfigFormValues()
    {
        return array(
		    'ARTSNOWSTORM_TWINKLE_EFFECT' => Tools::getValue('ARTSNOWSTORM_TWINKLE_EFFECT', Configuration::get('ARTSNOWSTORM_TWINKLE_EFFECT')),
			'ARTSNOWSTORM_MAX_ACTIVE' => Tools::getValue('ARTSNOWSTORM_MAX_ACTIVE', Configuration::get('ARTSNOWSTORM_MAX_ACTIVE')),
			'ARTSNOWSTORM_ON_BLUR' => Tools::getValue('ARTSNOWSTORM_ON_BLUR', Configuration::get('ARTSNOWSTORM_ON_BLUR')),
			'ARTSNOWSTORM_SNOW_STICK' => Tools::getValue('ARTSNOWSTORM_SNOW_STICK', Configuration::get('ARTSNOWSTORM_SNOW_STICK')),
			'ARTSNOWSTORM_MAX' => Tools::getValue('ARTSNOWSTORM_MAX', Configuration::get('ARTSNOWSTORM_MAX')),
			'ARTSNOWSTORM_FOLLOW_MOUSE' => Tools::getValue('ARTSNOWSTORM_FOLLOW_MOUSE', Configuration::get('ARTSNOWSTORM_FOLLOW_MOUSE')),
			'ARTSNOWSTORM_EXCLUDE_M' => Tools::getValue('ARTSNOWSTORM_EXCLUDE_M', Configuration::get('ARTSNOWSTORM_EXCLUDE_M')),
			'ARTSNOWSTORM_SNOW_COLOR' => Tools::getValue('ARTSNOWSTORM_SNOW_COLOR', Configuration::get('ARTSNOWSTORM_SNOW_COLOR')),
            'ARTSNOWSTORM_EMOJI' => Tools::getValue('ARTSNOWSTORM_EMOJI', Configuration::get('ARTSNOWSTORM_EMOJI', '❄️')),
            'ARTSNOWSTORM_FLAKE_SIZE' => Tools::getValue(
            'ARTSNOWSTORM_FLAKE_SIZE',
            (Configuration::get('ARTSNOWSTORM_FLAKE_SIZE') !== false && Configuration::get('ARTSNOWSTORM_FLAKE_SIZE') !== null)
                ? Configuration::get('ARTSNOWSTORM_FLAKE_SIZE')
                : 24
        ),
        );
    }

    /**
     * Save form data.
     */
    protected function postProcess()
    {
        $form_values = $this->getConfigFormValues();

        foreach (array_keys($form_values) as $key) {
            Configuration::updateValue($key, Tools::getValue($key));
        }
    }

    public function hookDisplayHeader()
    {
        // Legge le impostazioni esistenti
        $artsnowstorm_twinkle_effect = (bool) Configuration::get('ARTSNOWSTORM_TWINKLE_EFFECT');
        $artsnowstorm_follow_mouse = (bool) Configuration::get('ARTSNOWSTORM_FOLLOW_MOUSE');
        $artsnowstorm_on_blur = (bool) Configuration::get('ARTSNOWSTORM_ON_BLUR');
        $artsnowstorm_snow_color = pSQL(Configuration::get('ARTSNOWSTORM_SNOW_COLOR'));
        $artsnowstorm_max_active = (int) Configuration::get('ARTSNOWSTORM_MAX_ACTIVE');
        $artsnowstorm_max = (int) Configuration::get('ARTSNOWSTORM_MAX');
        $artsnowstorm_snow_stick = (bool) Configuration::get('ARTSNOWSTORM_SNOW_STICK');
        $artsnowstorm_exclude_m = (bool) Configuration::get('ARTSNOWSTORM_EXCLUDE_M');

        // Nuove impostazioni: flake size e shadow (legge dal DB o usa default)
        $artsnowstorm_flake_size = (int) Configuration::get('ARTSNOWSTORM_FLAKE_SIZE');
        if ($artsnowstorm_flake_size < 24) {
            $artsnowstorm_flake_size = 24; // default px
        }

        // Default Emoji (can be saved to DB as ARTNSOWSTORM_EMOJI if you want)
        $artsnowstorm_emoji = Configuration::get('ARTSNOWSTORM_EMOJI');
        if (empty($artsnowstorm_emoji)) {
            $artsnowstorm_emoji = '❄️';
        }
        // We don't need pSQL for emoji in JSON but we use it for consistency
        $artsnowstorm_emoji = pSQL($artsnowstorm_emoji);

        // Ottieni l'URL base evitando l'uso diretto di __PS_BASE_URI__
        $useSsl = (bool) Configuration::get('PS_SSL_ENABLED_EVERYWHERE') || (bool) Configuration::get('PS_SSL_ENABLED');
        $arturi = $this->context->link->getBaseLink((int) $this->context->shop->id, $useSsl);

        // Validazione colore (fallback se non valido)
        $artcolor_code = ltrim($artsnowstorm_snow_color, '#');
        if (!(ctype_xdigit($artcolor_code) && (Tools::strlen($artcolor_code) == 6 || Tools::strlen($artcolor_code) == 3))) {
            $artsnowstorm_snow_color = '#99ccff';
        }

        // Valori minimi sicuri
        if ($artsnowstorm_max_active < 1) {
            $artsnowstorm_max_active = 96;
        }
        if ($artsnowstorm_max < 1) {
            $artsnowstorm_max = 128;
        }

        $artsnowstorm_shadow = '0';

        // Prepara anche un oggetto di configurazione JSON per il template/JS
        $config = array(
            'flakeWidth'      => $artsnowstorm_flake_size,
            'flakeHeight'     => $artsnowstorm_flake_size,
            'snowColor'       => $artsnowstorm_snow_color,
            'snowCharacter'   => $artsnowstorm_emoji,
            'boxShadow'       => $artsnowstorm_shadow,
            'useTwinkleEffect'=> $artsnowstorm_twinkle_effect,
            'followMouse'     => $artsnowstorm_follow_mouse,
            'snowStick'       => $artsnowstorm_snow_stick,
            'excludeMobile'   => $artsnowstorm_exclude_m,
            'flakesMax'       => $artsnowstorm_max,
            'flakesMaxActive' => $artsnowstorm_max_active,
            'freezeOnBlur'    => $artsnowstorm_on_blur,
        );

        $this->smarty->assign(array(
            'artsnowstorm_twinkle_effect' => $artsnowstorm_twinkle_effect,
            'artsnowstorm_follow_mouse' => $artsnowstorm_follow_mouse,
            'artsnowstorm_snow_color' => $artsnowstorm_snow_color,
            'artsnowstorm_max_active' => $artsnowstorm_max_active,
            'artsnowstorm_on_blur' => $artsnowstorm_on_blur,
            'artsnowstorm_snow_stick' => $artsnowstorm_snow_stick,
            'artsnowstorm_exclude_m' => $artsnowstorm_exclude_m,
            'arturi' => $arturi,
            'artsnowstorm_max' => $artsnowstorm_max,
            'artsnowstorm_shadow' => $artsnowstorm_shadow,
            'artsnowstorm_flake_size' => $artsnowstorm_flake_size,
            'artsnowstorm_emoji' => $artsnowstorm_emoji,
            'artsnowstorm_config_json' => json_encode($config),
            'artsnowstorm_config' => $config,
        ));

        return $this->display(__FILE__, 'artsnowstorm.tpl');
    }

}
