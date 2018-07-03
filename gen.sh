#!/bin/bash
cd projects
ng new component-input-output --skip-install -S --style css
ng new component-next --skip-install -S --style css
ng new data-binding --skip-install -S --style css
ng new http --skip-install -S --style css
ng new http-async --skip-install -S --style css
ng new http-promise --skip-install -S --style css
ng new lifecycle --skip-install -S --style css
ng new need-http --skip-install -S --style css
ng new need-router --skip-install -S --style css
ng new need-services --skip-install -S --style css
ng new router --skip-install -S --style css
ng new router-eager --skip-install -S --style css
ng new router-lazy --skip-install -S --style css
ng new router-guard --skip-install -S --style css
ng new services-and-di --skip-install -S --style css
ng new storyline-tracker --skip-install -S --style css

mkdir compare
cd compare
mkdir angular
cd angular
ng new two-way --skip-install -S --style css
ng new binding-events --skip-install -S --style css
ng new component --skip-install -S --style css
ng new http --skip-install -S --style css
ng new property-binding --skip-install -S --style css
ng new services --skip-install -S --style css
ng new structural-directives --skip-install -S --style css

