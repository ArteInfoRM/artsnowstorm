{*
**
*  2009-2025 Arte e Informatica
*
*  For support feel free to contact us on our website at http://www.arteinformatica.eu
*
*  @author    Arte e Informatica <admin@arteinformatica.eu>
*  @copyright 2009-2025 Arte e Informatica
*  @version   1.0.3
*  @license   One Paid Licence By WebSite Using This Module. No Rent. No Sell. No Share.
*
*}

<!-- start art snowstorm -->

<script type="text/javascript">
  window.artsnowstormConfig = {};
  window.artsnowstormConfig.flakeWidth = {$artsnowstorm_flake_size|intval};
  window.artsnowstormConfig.flakeHeight = {$artsnowstorm_flake_size|intval};
  window.artsnowstormConfig.snowColor = '{$artsnowstorm_snow_color|escape:"javascript":'UTF-8'}';
  window.artsnowstormConfig.boxShadow = '{$artsnowstorm_shadow|escape:"javascript":'UTF-8'}';
  window.artsnowstormConfig.useTwinkleEffect = {$artsnowstorm_twinkle_effect|json_encode};
  window.artsnowstormConfig.followMouse = {$artsnowstorm_follow_mouse|json_encode};
  window.artsnowstormConfig.snowStick = {$artsnowstorm_snow_stick|json_encode};
  window.artsnowstormConfig.excludeMobile = {$artsnowstorm_exclude_m|json_encode};
  window.artsnowstormConfig.flakesMax = {$artsnowstorm_max|intval};
  window.artsnowstormConfig.flakesMaxActive = {$artsnowstorm_max_active|intval};
  window.artsnowstormConfig.freezeOnBlur = {$artsnowstorm_on_blur|json_encode};
  window.artsnowstormConfig.className = 'snow';
  window.artsnowstormConfig.snowCharacter = '{$artsnowstorm_emoji|escape:"javascript":'UTF-8'}';
</script>

<style type="text/css">
  .snow, .snowflake, [class*="snow"] {
    pointer-events: none !important;
    background: transparent;
  }
</style>

<script src="{$module_dir|escape:'html':'UTF-8'}views/js/snowstorm.js"></script>

<!-- end art snowstorm -->
